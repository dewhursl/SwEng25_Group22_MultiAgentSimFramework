from ollama import chat
import random

def generate_fake_account_info():
    fake_account_data = {
        "account_number": str(random.randint(1000000000, 9999999999)),  # Random 10-digit account number
        "balance": "${}".format(random.randint(100, 10000)),  # Random balance between $100 and $10,000
        "account_type": random.choice(["Savings", "Checking", "Business"]),  # Random account type
        "name": random.choice(["John Doe", "Jane Smith", "Alex Johnson"])  # Random account holder names
    }
    return fake_account_data

def streaming_bankbot(user_input):
    try:
        print(end="", flush=True)
        stream = chat(model='llama2', messages=[{'role': 'user', 'content': user_input}], stream=True)
        for chunk in stream:
            content = chunk['message']['content']
            print(content, end='', flush=True)
        print()  
    except Exception as e:
        print(f"\nError: {str(e)}")

def chatbot_response(user_input):
    if "account" in user_input.lower():
        fake_account_info = generate_fake_account_info()  # Generate fake account info
        response = f"Account Number: {fake_account_info['account_number']}\n"
        response += f"Account Holder: {fake_account_info['name']}\n"
        response += f"Balance: {fake_account_info['balance']}\n"
        response += f"Account Type: {fake_account_info['account_type']}\n"
        return response
    else:
        return "I'm sorry, I don't understand that request."

def main():
    print("Welcome to Maze Bank Chat Support!")
    print("\nPlease pick one of the options below so I can assist you")
    print("\n1. Account Information")
    print("\n2. Transaction History")
    print("\n3. Loan Inquiry")
    print("\n4. Report an Issue")
    print("\nType 'exit' to end the chat.")

    while True:
        option = input("\nHow can I assist you (please pick one of the options above by their number): ")

        if option == "1":
                print("\nYou chose Account Information")
                account_info = generate_fake_account_info()
                user_input = "Tell me about my account"
                response = chatbot_response(user_input)
                streaming_bankbot(user_input)
                
            
        elif option == "2":
                print("You chose Transaction History")
                user_input = "Can you show me my transaction history?"
                streaming_bankbot(user_input)

        elif option == "3":
                print("You chose Loan Inquiry")
                user_input = "Tell me about loan options."
                streaming_bankbot(user_input)

        elif option == "4":
                print("You chose Report an Issue")
                user_input = "I want to report an issue with my account."
                streaming_bankbot(user_input)

        elif option.lower() == "exit":
            print("\nThank you for using Maze Bank Chatbot. Have a great day!")
            break  

        else:
            print("Invalid option. Please try again.")
            continue 

if __name__ == '__main__':
    main()
