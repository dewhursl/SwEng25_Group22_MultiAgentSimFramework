import React, { useRef, useEffect, useState } from "react";
import { Application, Assets, Sprite } from "pixi.js";

export default function Renderer() {
    const containerRef = useRef(null);

    useEffect(() => {
        console.log('Renderer mounted.');

        const app = new Application();

        const promise = app.init();

        const clean = async () => {
            await promise;
            app.destroy(true);
            console.log('App destroyed');
        }

        const init = async () => {
            await promise;

            containerRef.current.appendChild(app.canvas);

            const texture = await Assets.load('src/assets/sprites/sample.png');

            const sprite = Sprite.from(texture);

            sprite.anchor.set(0.5);
            sprite.x = app.screen.width / 2;
            sprite.y = app.screen.height / 2;

            app.stage.addChild(sprite);

            let time = 0;

            app.ticker.add((ticker) => {
                time += ticker.deltaTime;
                sprite.x += Math.cos(time / 50);
            })

            console.log('App initialized');
        }

        init();

        return () => clean();
    }, []);


    return (<div ref={containerRef} />);
}
