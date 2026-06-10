"""
Dating App Recommendation Service
- Ollama for LLM + Embeddings
- ChromaDB for vector storage & semantic search
- Collaborative filtering signals
"""

from flask import Flask, request, jsonify
import chromadb
import ollama
import json
import time
import os
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

# ===== Config =====
OLLAMA_EMBED_MODEL = os.getenv("OLLAMA_EMBED_MODEL", "bge-m3")
OLLAMA_CHAT_MODEL = os.getenv("OLLAMA_CHAT_MODEL", "llama3.2:3b")
CHROMA_PATH = os.getenv("CHROMA_PATH", "/home/yyw/dating-app/packages/recommender/chroma_data")

# ===== ChromaDB Setup =====
client = chromadb.PersistentClient(path=CHROMA_PATH)

def get_or_create_collection(name: str):
    try:
        return client.get_collection(name)
    except:
        return client.create_collection(name=name, metadata={"hnsw:space": "cosine"})

user_collection = get_or_create_collection("user_profiles")
like_collection = get_or_create_collection("like_patterns")

# ===== Embedding =====

def build_profile_text(profile: dict) -> str:
    """Build a rich text representation of a user for embedding."""
    parts = []
    parts.append(f"Gender: {profile.get('gender', 'unknown')}")
    parts.append(f"Age: {profile.get('age', 0)}")
    if profile.get("bio"):
        parts.append(f"Bio: {profile['bio']}")
    if profile.get("tags"):
        parts.append(f"Interests: {', '.join(profile.get('tags', []))}")
    if profile.get("mbti"):
        parts.append(f"MBTI: {profile['mbti']}")
    if profile.get("bigFive"):
        bf = profile["bigFive"]
        parts.append(f"Personality: O:{bf.get('openness',0.5):.1f} C:{bf.get('conscientiousness',0.5):.1f} E:{bf.get('extraversion',0.5):.1f} A:{bf.get('agreeableness',0.5):.1f} N:{bf.get('neuroticism',0.5):.1f}")
    if profile.get("questionnaire"):
        q = profile["questionnaire"]
        if q.get("attachmentLabel"):
            parts.append(f"Attachment: {q['attachmentLabel']}")
        if q.get("loveLanguageLabel"):
            parts.append(f"Love language: {q['loveLanguageLabel']}")
        if q.get("conflictLabel"):
            parts.append(f"Conflict style: {q['conflictLabel']}")
        if q.get("lifeGoal"):
            parts.append(f"Looking for: {q['lifeGoal']}")
    return "\n".join(parts)

def get_embedding(text: str) -> list[float]:
    """Get embedding from Ollama."""
    resp = ollama.embeddings(model=OLLAMA_EMBED_MODEL, prompt=text)
    return resp["embedding"]

# ===== Core API =====

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "collections": {
        "users": user_collection.count(),
        "likes": like_collection.count()
    }})

@app.route("/embed-user", methods=["POST"])
def embed_user():
    """Generate and store user embedding."""
    data = request.json
    user_id = data["userId"]
    profile = data["profile"]
    text = build_profile_text(profile)
    embedding = get_embedding(text)

    user_collection.upsert(
        ids=[user_id],
        embeddings=[embedding],
        metadatas=[{"updated_at": str(time.time())}]
    )
    return jsonify({"status": "ok", "userId": user_id, "embeddingDim": len(embedding)})

@app.route("/batch-embed", methods=["POST"])
def batch_embed():
    """Batch embed multiple users."""
    data = request.json
    users = data.get("users", [])
    ids, embeddings, metadatas = [], [], []
    for u in users:
        text = build_profile_text(u["profile"])
        emb = get_embedding(text)
        ids.append(u["userId"])
        embeddings.append(emb)
        metadatas.append({"updated_at": str(time.time())})
    if ids:
        user_collection.upsert(ids=ids, embeddings=embeddings, metadatas=metadatas)
    return jsonify({"status": "ok", "count": len(ids)})

@app.route("/similar-users", methods=["POST"])
def similar_users():
    """Find similar users via vector search."""
    data = request.json
    user_id = data["userId"]
    top_k = data.get("topK", 20)
    exclude_ids = data.get("excludeIds", [])
    gender_filter = data.get("genderFilter")

    try:
        # Get the user's embedding
        result = user_collection.get(ids=[user_id], include=["embeddings"])
        if not result["embeddings"]:
            # User not embedded yet - build from profile
            if not data.get("profile"):
                return jsonify({"users": [], "error": "User not in index and no profile provided"})
            text = build_profile_text(data["profile"])
            embedding = get_embedding(text)
        else:
            embedding = result["embeddings"][0]

        # Query similar
        where_filter = None
        if gender_filter:
            where_filter = {"gender": gender_filter}

        results = user_collection.query(
            query_embeddings=[embedding],
            n_results=top_k + len(exclude_ids) + 1,
            where=where_filter,
            include=["metadatas", "distances"]
        )

        users = []
        if results["ids"] and results["ids"][0]:
            for i, uid in enumerate(results["ids"][0]):
                if uid == user_id or uid in exclude_ids:
                    continue
                dist = results["distances"][0][i] if results["distances"] else 0
                # cosine distance → similarity score [0,1]
                score = max(0, 1 - dist)
                users.append({"userId": uid, "score": round(score, 4)})
                if len(users) >= top_k:
                    break

        return jsonify({"users": users})
    except Exception as e:
        return jsonify({"users": [], "error": str(e)})

@app.route("/match-explanation", methods=["POST"])
def match_explanation():
    """Generate AI explanation for why two users might match."""
    data = request.json
    user_a = data["userA"]
    user_b = data["userB"]

    prompt = f"""You are a dating match advisor. Given two people's profiles, explain in 2-3 sentences in Chinese why they might be a good match. Be specific, warm, and encouraging.

Person A: {json.dumps(user_a, ensure_ascii=False, indent=2)}
Person B: {json.dumps(user_b, ensure_ascii=False, indent=2)}

Explanation in Chinese:"""

    try:
        resp = ollama.chat(model=OLLAMA_CHAT_MODEL, messages=[
            {"role": "user", "content": prompt}
        ])
        explanation = resp["message"]["content"].strip()
        return jsonify({"explanation": explanation})
    except Exception as e:
        # Fallback
        common_tags = set(user_a.get("tags", [])) & set(user_b.get("tags", []))
        fallback = f"你们都是{user_a.get('city', '同城')}的用户"
        if common_tags:
            fallback += f"，有共同的兴趣：{'、'.join(list(common_tags)[:3])}"
        if user_a.get("mbti") and user_b.get("mbti"):
            fallback += "，性格类型互补"
        return jsonify({"explanation": fallback, "fallback": True})

@app.route("/chat-suggestion", methods=["POST"])
def chat_suggestion():
    """Generate AI chat topic or opening line."""
    data = request.json
    user_a = data["userA"]
    user_b = data["userB"]
    context = data.get("context", "first_message")  # first_message | conversation | date_idea
    recent_msgs = data.get("recentMessages", [])

    if context == "first_message":
        prompt = f"""You are a helpful dating assistant. Two people just matched. Write a natural, warm opening message in Chinese (max 30 words) based on their profiles.

Person A (sender): {json.dumps(user_a, ensure_ascii=False, indent=2)}
Person B (receiver): {json.dumps(user_b, ensure_ascii=False, indent=2)}

Generate 3 opening messages in Chinese, separated by newlines. Keep each short and natural (like a real person, not cheesy pickup lines):"""
    elif context == "conversation":
        convo = "\n".join([f"{'A' if m['isMine'] else 'B'}: {m['content']}" for m in recent_msgs[-5:]])
        prompt = f"""Based on this conversation, suggest a natural next message or question in Chinese to keep the conversation flowing.

Recent conversation:
{convo}

Suggest 2-3 natural replies in Chinese (short, like a real person):"""
    else:  # date_idea
        prompt = f"""These two people matched on a dating app. Suggest 3 date ideas in Chinese based on their shared interests.

Person A: {json.dumps(user_a, ensure_ascii=False, indent=2)}
Person B: {json.dumps(user_b, ensure_ascii=False, indent=2)}

Suggest 3 date ideas in Chinese, each one sentence:"""

    try:
        resp = ollama.chat(model=OLLAMA_CHAT_MODEL, messages=[
            {"role": "user", "content": prompt}
        ])
        suggestions = [s.strip() for s in resp["message"]["content"].strip().split("\n") if s.strip()]
        return jsonify({"suggestions": suggestions[:5]})
    except Exception as e:
        return jsonify({"suggestions": [
            "Hi！看了你的资料觉得很有意思 😊",
            "你也喜欢旅行吗？最近去了哪里？",
            "很高兴认识你！"
        ], "fallback": True})

@app.route("/daily-picks/<user_id>", methods=["GET"])
def daily_picks(user_id):
    """Get daily recommended picks combining vector similarity + collaborative signals."""
    # This is a simplified version - in production, combine multiple signals
    try:
        result = user_collection.get(ids=[user_id], include=["embeddings"])
        if not result["embeddings"]:
            return jsonify({"picks": [], "reason": "User not indexed yet"})

        embedding = result["embeddings"][0]
        results = user_collection.query(
            query_embeddings=[embedding],
            n_results=30,
            include=["metadatas"]
        )

        picks = []
        if results["ids"] and results["ids"][0]:
            for i, uid in enumerate(results["ids"][0]):
                if uid == user_id:
                    continue
                dist = results["distances"][0][i] if results["distances"] else 0
                score = max(0, 1 - dist)
                picks.append({"userId": uid, "score": round(score, 4)})
                if len(picks) >= 10:
                    break

        return jsonify({"picks": picks})
    except Exception as e:
        return jsonify({"picks": [], "error": str(e)})

@app.route("/record-like", methods=["POST"])
def record_like():
    """Record like pattern for collaborative filtering."""
    data = request.json
    user_id = data["userId"]
    liked_id = data["likedId"]
    action = data.get("action", "like")  # like, pass, superlike

    like_collection.add(
        ids=[f"{user_id}_{liked_id}_{int(time.time())}"],
        embeddings=[[0.0] * 768],  # placeholder - we only use metadata
        metadatas=[{
            "userId": user_id,
            "targetId": liked_id,
            "action": action,
            "timestamp": time.time()
        }]
    )
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    print("🚀 Starting Dating Recommendation Service...")
    print(f"   ChromaDB: {CHROMA_PATH}")
    print(f"   Embed: {OLLAMA_EMBED_MODEL}, Chat: {OLLAMA_CHAT_MODEL}")
    print(f"   Users indexed: {user_collection.count()}")
    app.run(host="0.0.0.0", port=5002, debug=False)
