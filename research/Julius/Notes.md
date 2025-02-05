# First Attempt with Ollama & SmolAgents

## ❌ Issues with Ollama

I attempted to use **Ollama** with **SmolAgents** in my `FirstAttempt.py` file, but I kept running into this error:

Error in generating model output: litellm.APIConnectionError: Ollama_chatException - Client error '400 Bad Request' for url 'http://127.0.0.1:11434/api/chat'


I've spent hours trying to fix it, but nothing has worked so far.  
If anyone knows how to resolve this, please let me know—I’d really appreciate it!

---

## ✅ Success with Kitty's Code

I copied **Kitty's Detective/Suspect Code**, and it worked immediately.  
This makes me wonder if my issue is with **Ollama's setup** or something specific in my code.

---

## 🔍 What I'm Working on Next

Now, I'm researching:
1. **Monte Carlo simulations for dialogue modeling** – Seeing if randomness can make conversations more interesting.
2. **Extracting useful statistics** – Looking for patterns in responses.
3. **Adding traits to agents** – Testing how factors like:
   - **Agreeableness** (how likely they are to agree)
   - **Confidence** (how assertive they are)
   - **Curiosity** (how much they ask questions)
   
   can change interactions.

### 🎨 Visualization Ideas
I'm also thinking about fun ways to **visualize conversations**, like:
- **Conversation trees** 🌳 to map out interactions.
- **Graphs or networks** 🔗 showing connections between responses.
- **Emotion-based heatmaps** 📊 to track tone changes.

## 🕵️ Detective-Suspect Dialogue with AutoGen + Ollama

 I managed to get a **detective-suspect** AI conversation working using **Microsoft’s AutoGen** library with **Ollama** for local LLM inference. I used Sebastian's code to set it up. 
- **Detective Agent**: Questions and analyzes answers.
- **Suspect Agent**: Tries to remain calm and deflect.

This success means Ollama is now **correctly** serving a model with an OpenAI-like interface, and AutoGen can orchestrate the dialogue.

---
