##################################################################################
# 2 agent simulation with stopping condition using prompt engineering (protoype) #
##################################################################################

from together import Together

from dotenv import load_dotenv
load_dotenv()

from agent import Agent

client = Together()

output_variables = {
    "car_make": "String",
    "car_price": "Number"
}

customer = Agent(
    client=client,
    base_instructions="Act like a customer who is talking to a car salesman about buying a car. Keep messages quite short.",
    end_goal="Buy a car.",
    output_variables=output_variables
)

salesman = Agent(
    client=client,
    base_instructions="Act like a car salesman who is talking to a customer and trying to sell them a car. Keep messages quite short.",
    end_goal="Sell a car.",
    output_variables=output_variables
)

# chat loop
customer.gen()
salesman_message = salesman.gen()
print("Salesman: " + salesman_message + "\n")

conversation_done = False
while not conversation_done:
    customer_message = customer.gen(salesman_message)
    print("Customer: " + customer_message + "\n")
    salesman_message = salesman.gen(customer_message)
    print("Salesman: " + salesman_message + "\n")
    
    for vname in output_variables:
        if vname in customer_message or vname in salesman_message:
            conversation_done = True