'use client';

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadLinksPreset } from "@tsparticles/preset-links";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadLinksPreset(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      preset: "links",
      background: {
        color: {
          value: "transparent", // Use a light gray background that matches the theme
        },
      },
      particles: {
        color: {
          value: "#ffffff", // Gray particles
        },
        links: {
          color: "#ffffff", // Gray links
          distance: 150,
          enable: true,
          opacity: 0.6,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.5,
        }
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          onClick: {
            enable: true,
            mode: "push",
          },
        },
        modes: {
          grab: {
            distance: 200,
            links: {
              opacity: 1
            }
          },
          push: {
            quantity: 4,
          },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="particles-bg"
      />
    );
  }

  return null;
}
