import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.
import "../App.css";
export default function ParticlesComponent() {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);

      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };
  
  const options: ISourceOptions = useMemo(() => {
    const isMobile = (): boolean => {return window.innerWidth <= 1000}
  
    return {
      background: {
        color: {
          value: "#0d47a1",
        },
      },
      fpsLimit: isMobile()?30:60,
      interactivity: {
        events: {
          onClick: {
            enable: isMobile()?false:true,
            mode: "push",
          },
          onHover: {
            enable: isMobile()?false:true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: false,
          speed: 6,
          straight: false,
        },
        number: {
          value: isMobile() ? 5 : 50, // Dynamically adjust particle count
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "polygon",
        },
        size: {
          value: { min: 5, max: 10 },
        },
      },
      detectRetina: true,
    };
  }, []); // Keep the dependencies empty unless dynamic conditions change
  
  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return <></>;
}
