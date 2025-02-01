import random, string

class Agent:
    INSTRUCTIONS_TEMPLATE = "Instructions: You are an Agent. {}\n\nEnd Goal: {}\n\n\nKeep the conversation as short and to-the-point as possible. When \"End Goal\" is reached, respond with the following information as a set of Python variables (DO NOT DISTURB THE FLOW OF THE CONVERSATION IN DOING SO):\n{}\n\n{}"

    def __init__(self, client, base_instructions, end_goal, output_variables, model_name="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"):
        self.client = client
        self.instructions = self.INSTRUCTIONS_TEMPLATE.format(
            base_instructions,
            end_goal,
            "\n".join(["{} ({})".format(vname, vtype) for vname, vtype in output_variables.items()]),
            __class__._randomword(20) # randomness to ensure scenarios are not duplicated
        )
        self.model_name = model_name
        self.messages = []

    def gen(self, prompt=None):
        if prompt == None:
            prompt = self.instructions
        self.messages.append({"role": "user", "content": prompt})
        response = self.client.chat.completions.create(
            model=self.model_name,
            messages=self.messages
        ).choices[0].message.content
        self.messages.append({"role": "assistant", "content": response})
        return response
    
    def _randomword(length):
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(length))