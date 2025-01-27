from together import Together

from dotenv import load_dotenv
load_dotenv()

class Agent:
    def __init__(self, client, instructions, model_name="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"):
        self.client = client
        self.instructions = instructions
        self.model_name = model_name
        self.messages = []

    def initial_message(self):
        return self.chat(self.instructions) 

    def chat(self, message):
        self.messages.append({"role": "user", "content": message})
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=self.messages
        ).choices[0].message.content
        self.messages.append({"role": "assistant", "content": response})
        return response

class UserSim(Agent):
    def __init__(self, client, instructions, talking_to, model_name="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"):
        self.client = client
        self.instructions = instructions + "\n\n[The next message I send will be from \"{}\", that will be the start of your conversation]".format(talking_to)
        self.model_name = model_name
        self.messages = []

    def initialize_chat(self):
        self.chat(self.instructions)

    def initial_message(self):
        raise NotImplementedError

# initialization

client = Together()

usersim = UserSim(
    client,
    instructions="Act like a customer at a car dealership talking to the salesman. You are looking to buy a car. Keep messages quite short.",
    talking_to="Car Salesman"
)

agent = Agent(
    client,
    instructions="Act like a car salesman talking to a customer. Keep messages quite short."
)

# chat loop

usersim.initialize_chat()
agent_message = agent.initial_message()
print("AGENT: " + agent_message + "\n")
while True:
    user_message = usersim.chat(agent_message)
    print("*USER: " + user_message + "\n")
    agent_message = agent.chat(user_message)
    print("AGENT: " + agent_message + "\n")
