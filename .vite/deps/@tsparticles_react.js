import {
  require_jsx_runtime
} from "./chunk-32NEGIXE.js";
import {
  require_react
} from "./chunk-65KY755N.js";
import {
  tsParticles
} from "./chunk-VVDX2HWJ.js";
import {
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/@tsparticles/react/dist/Particles.js
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var import_react = __toESM(require_react(), 1);
var f = (t) => {
  const i = t.id ?? "tsparticles";
  return (0, import_react.useEffect)(() => {
    let e;
    return tsParticles.load({ id: i, url: t.url, options: t.options }).then((l) => {
      var a;
      e = l, (a = t.particlesLoaded) == null || a.call(t, l);
    }), () => {
      e == null || e.destroy();
    };
  }, [i, t, t.url, t.options]), (0, import_jsx_runtime.jsx)("div", { id: i, className: t.className });
};

// node_modules/@tsparticles/react/dist/index.js
var import_jsx_runtime2 = __toESM(require_jsx_runtime());
var import_react2 = __toESM(require_react());
async function n(t) {
  await t(tsParticles);
}
export {
  f as Particles,
  f as default,
  n as initParticlesEngine
};
//# sourceMappingURL=@tsparticles_react.js.map
