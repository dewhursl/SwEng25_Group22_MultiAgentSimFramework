// Read in simulation state from JSON
const simulation = await fetch('./json/simulation.json')
    .then(response => response.json())
    .catch(error => console.error('Error loading JSON: ', error));

// Initialize application
const app = new PIXI.Application();
await app.init({ width: 640, height: 360 });
document.body.appendChild(app.canvas);

// Initialize agents
simulation.agents.forEach(async (agent) => {
    const texture = 'textures/' + agent.texture;

    await PIXI.Assets.load(texture);
    agent.sprite = PIXI.Sprite.from(texture);

    agent.sprite.x = agent.position.x;
    agent.sprite.y = agent.position.y;

    app.stage.addChild(agent.sprite);
});

// Animate Rendering
let elapsed = 0.0;

app.ticker.add((ticker) => {
    elapsed += ticker.deltaTime;

    simulation.agents.forEach(async agent => {
        agent.sprite.x = agent.position.x + Math.cos(elapsed / 50.0) * 100;
    })
});