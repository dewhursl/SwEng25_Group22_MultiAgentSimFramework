from dotenv import load_dotenv
load_dotenv()

#from airflow import DAG
#from airflow.operators.python import PythonOperator

from sim.simulation import Simulation


def main():
    print("Initialising Simulation")
    sim = Simulation("car_sale_simulation.json")

    print("Running Simulation")
    sim.run()
    #import ipdb; ipdb.set_trace()

if __name__ == "__main__":
    main()