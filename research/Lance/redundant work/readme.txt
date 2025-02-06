barebones use of swarm but using ollama llm instead of openai.
This is code I found and tried to modify to give us a good base to
build our own agents on top of the framework (with moderate success).

It still seems to rely on agents that I have removed so often redirects
with no output.

I think this is a good start to build agents on top of swarm + ollama but
further improvements to this build will have to be made which is hard to say
how long or easy that may be.

To run in terminal (annoconda):

1. cd to Lance\local-swarm-agent.

2. then run .\plswork\Scripts\activate.

3. finally run python run.py. (sometimes i get a memory error on my laptop.
 I can only run the program when other programs are closed)