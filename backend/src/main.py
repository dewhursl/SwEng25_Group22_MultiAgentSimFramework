from dotenv import load_dotenv
load_dotenv()

from sim.simulation import Simulation


def main():
    print("Initialising Simulation")
    sim = Simulation("car_sale_simulation.json")

    print("Running Simulation")
    sim.run()


if __name__ == "__main__":
    main()