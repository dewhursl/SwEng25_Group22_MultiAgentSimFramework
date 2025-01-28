import settings
import utils
import basic_test
import basic_sim
import sys

print("Starting Program");

# Profiling
start_time = None;
end_time = None;
time_taken = None;
if (settings.PROFILING_ENABLED):
    start_time = utils.current_nano_time();

if (sys.argv.__len__() == 1):
    print("Error, no argument given for test");
    print("Try arguments: test, sim");
    quit();

# Run Test
sysArg = sys.argv[1];
if (sysArg == "test"):
    basic_test.run_test();
elif (sysArg == "sim"):
    basic_sim.run_test();
else:
    print("Error, invaid argument");
    print("Try arguments: test, sim");
    quit();

# Profiling
if (settings.PROFILING_ENABLED):
    end_time = utils.current_nano_time();
    time_taken = end_time - start_time;
    print("===================================");
    print("Time taken for response was " + utils.time_ns_to_str(time_taken));