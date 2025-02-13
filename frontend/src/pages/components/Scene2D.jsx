import React, { useRef, useEffect } from "react";
import { Application, Assets, Sprite } from "pixi.js";

export default function Renderer({ simulationData }) {
    const { agents, conversation } = simulationData;

    // Reference to the React object wrapping the PixiJS canvas
    const containerRef = useRef(null);

    // Reference to PixiJS application object
    const appRef = useRef(null);

    // Reference to an array of sprites currently in the scene
    const spritesRef = useRef([]);

    // Reference to ellapsed time of the render
    const timeRef = useRef(0);

    // Called once per frame
    const draw = (ticker) => {
        for (const sprite of spritesRef.current) {
            sprite.x += Math.cos(timeRef.current / 50);
        }
        timeRef.current += ticker.deltaTime;
    }

    // Create a new sprite from a builder object and add it to the scene
    // x, y - Initial position of the sprite
    // anchor - Centrepoint of the sprite
    // texture - URL to a texture asset
    const createSprite = async (
        builder = {
            x: appRef.current.screen.width / 2,
            y: appRef.current.screen.height / 2,
            anchor: 0.5,
            texture: 'sprites/sample.png'
        }
    ) => {
        const texture = await Assets.load(builder.texture);
        const sprite = Sprite.from(texture);

        sprite.anchor.set(builder.anchor)
        sprite.x = builder.x;
        sprite.y = builder.y;

        appRef.current.stage.addChild(sprite);
        spritesRef.current.push(sprite);
    }

    // Hook to initialize the renderer upon mounting of the React object
    useEffect(() => {
        const app = new Application();
        appRef.current = app;

        const promise = app.init();

        // Destroy the app upon unmount. An async function is required here
        // since the application may still be initializing.
        const clean = async () => {
            await promise;
            app.destroy(true);
        }

        // Wait for the application to be created and perform initialization.
        const init = async () => {
            await promise;

            containerRef.current.appendChild(app.canvas);

            createSprite();

            app.ticker.add((ticker) => draw(ticker));
        }

        init();

        return () => clean();
    }, []);


    return (<div ref={containerRef} />);
}
