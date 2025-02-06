from ollama import chat
from faker import Faker
import ollama
import random

fake = Faker()

def generate_fake_info():
    return {
        "Name": fake.name(),
        "Address": fake.address(),
        "Email": fake.email(),
        "Phone": fake.phone_number(),
        "SSN": fake.ssn(),
        "Company": fake.company(),
        "Job": fake.job(),
    }

def generate_fake_transac_history():
     fake_price = generate_fake_price()
     return {
          "Today": fake.company() + " $" + str(fake_price),
          "Yesterday": fake.company() + " $" + str(fake_price),
          "3 Feb": fake.company() + " $" + str(fake_price),
          "31 Jan": fake.company() + " $" + str(fake_price),
          "26 Jan": fake.company() + " $" + str(fake_price)
     }

def generate_fake_price():
    return round(random.uniform(5.0, 500.0), 2)

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
    # Check if the user asks for personal details
    if "My Details" in user_input:
        fake_info = generate_fake_info()
        response = "\n".join([f"{key}: {value}" for key, value in fake_info.items()])
        return response
    elif "My History" in user_input:
        fake_history = generate_fake_transac_history()  # Keep dictionary format
        response = "\n".join([f"{key}: {value}" for key, value in fake_history.items()])  # Format properly
        return response
    else:
        # Use Ollama to generate a chatbot response
            streaming_bankbot(user_input)
            model="llama2",
            messages=[{"role": "user", "content": user_input}],
            stream=True,
    return "".join(chunk["message"]["content"] for chunk in stream)

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
                print("\nPlease select:")
                print("\n- My Details")
                print("\n- Exit")
                user_input = input("\nYou: ")
                if ("Exit" in user_input):
                     continue;
                else:
                    response = chatbot_response(user_input)
                    print(response)
            
        elif option == "2":
                print("You chose Transaction History")
                print("\nPlease select:")
                print("\n- My History")
                print("\n- Exit")
                user_input = input("\nYou: ")
                if ("Exit" in user_input):
                     continue;
                else:
                    response = chatbot_response(user_input)
                    print(response)

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
