# Plan

Things to Try:
- Get ollama working
- Run basic simulation
- Use a third agent to determine winner
- Figure out how to parallelize simulations
- Run monte carlo sims 
- Generate stats and make graphs
- Figure out how to use the GPU for performance boosts
- TTS
- Stop conditions, whatever they are
- Try smaller models

## Get Ollama Working

First step is downloading, bosh
We need to pick out a model I think
    It seems to have downloaded llama3.2 by default
You can test ollama with the terminal using `ollama run llama3.2` 
Then lets try creating a basic py script that calls it with a string and gets a response 
Then lets make some classes to encapsulate stuff

There's a feature you can do where you can make new models that have custom init prompts like "Speak only in <language>" 

### Ollama With Python

First step is to `pip install ollama` 
Then you `import ollama` 
`response = ollama.generate(model, prompt);` 

## Run basic simulation

This was very easy to set up. Still too slow though

## Run 3 agent simulation

Also pretty easy to write. Very cute responses

## Parallelizing the Simulations

Made a new test for running multiple generations in parallel 
Seeing massive gains. Generally it's about 130% faster than running them serially 
Wondering if something is off though, maybe the gains aren't coming from them actually running in parallel but instead somewhere else
Soon I should work on parallelizing any type of test 

## Notes

I see CUDA mentioned while Ollama is downloading

Profiling a basic response from ollama on my laptop takes 38,000ms which is obviously beyond abhorrent so I need to find a way to speed this up multiple orders of magnitude if I can. Or at least utilize the downtime somehow
    Obviously part of this is how weak my GPU is on my laptop so I'll be interested to see the speed up on my desktop


## TODO

- Fix load duration profiling not making any sense