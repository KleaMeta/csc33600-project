# ai_rag.py

from google import genai
import os

from app.db.session import database

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# text embedding function using Gemini API
def embed_text(text: str):
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
    )
    return response.embeddings[0].values

#chef search function using vector similarity in SQL
async def search_chefs_by_embedding(embedding, limit: int = 5):
    # Call the list method
    for model in client.models.list():
        print(f"Model Name: {model.name}")
        print(f"Supported Methods: {model.supported_generation_methods}")
        print("-" * 30)
        
    embedding_as_str = str(embedding) 

    query = """
        SELECT
            chef_data.chef_id,
            "user".name,
            "user".description,
            chef_data.food_specialty,
            chef_data.embedding <=> :embedding AS distance
        FROM chef_data 
        JOIN "user" ON chef_data.chef_id = "user".user_id
        ORDER BY distance ASC
        LIMIT :limit
    """

    return await database.fetch_all(
        query,
        {"embedding": embedding_as_str, "limit": limit},
    )


def format_chef_context(chefs):
    return "\n\n".join(
        [
            f"""
                Chef: {c['name']}
                Specialty: {c['food_specialty']}
                Description: {c['description']}
            """
            for c in chefs
        ]
    )


async def get_chef_recommendations(request_text: str):
    # 1. embed query
    query_embedding = embed_text(request_text)
    
    # 2. retrieve similar chefs
    chefs = await search_chefs_by_embedding(query_embedding)

    # 3. format context
    context = format_chef_context(chefs)

    # 4. ask Gemini
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=f"""
                    You are a chef recommendation system.

                    User request:
                    {request_text}

                    Relevant chefs:
                    {context}

                    Pick the best match and explain why.
                    """
    )

    return {
        "chefs": chefs,
        "recommendation": response.text
    }