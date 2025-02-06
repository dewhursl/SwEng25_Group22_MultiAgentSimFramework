import ollama
from ollama import chat

def streaming_chat(user_input):
    try:
        print("\nAI: ", end="", flush=True)
        stream = chat(model='llama2', messages=[{'role': 'user', 'content': user_input}], stream=True)
        for chunk in stream:
            content = chunk['message']['content']
            print(content, end='', flush=True)
        print() 
    except Exception as e:
        print(f"\nError: {str(e)}")



def main():
    print("Welcome to Customer Support! How may I help you?")
    while (True):
        user_input = input("You: ")
        if user_input.lower() in {"exit", "quit"}:
            print("Goodbye!")
            break
        streaming_chat(user_input)

if __name__ == "__main__":
    main()
