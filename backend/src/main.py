from dotenv import load_dotenv
load_dotenv()

from sim.simulation import Simulation


def main():
    sim = Simulation("car_sale_simulation.json")
    sim.run()


if __name__ == "__main__":
    main()