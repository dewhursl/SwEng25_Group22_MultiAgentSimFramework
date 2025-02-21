from dotenv import load_dotenv
load_dotenv()

import ipdb

from sim.simulation import Simulation

def main():
    print("Initialising Simulation")
    sim = Simulation("car_sale_simulation.json")

    ipdb.set_trace()
    
    print("Running Simulation")    
    sim.run()

if __name__ == "__main__":
    main()