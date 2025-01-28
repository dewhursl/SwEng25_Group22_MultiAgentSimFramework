import settings
import utils
import basic_test
import basic_sim

print("Starting Program");

# Profiling
start_time = None;
end_time = None;
time_taken = None;
if (settings.PROFILING_ENABLED):
    start_time = utils.current_nano_time();

# Run Test
#basic_test.run_test();
basic_sim.run_test();

# Profiling
if (settings.PROFILING_ENABLED):
    end_time = utils.current_nano_time();
    time_taken = end_time - start_time;
    print("===================================");
    print("Time taken for response was " + utils.time_ns_to_str(time_taken));