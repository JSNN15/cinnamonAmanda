#!/usr/bin/env python3
"""
Cinnamoroll World v42 - Regresiones UX reportadas por la usuaria (prueba real en tablet)
=======================================================================================
Verifica en Chrome headless (CDP) los 5 bugs corregidos en v42:
  R1. Pestaña "En la mano" (varita): cada miniatura dibuja un objeto DISTINTO (antes todas iguales
      porque heldItem pisaba a propId) y existe la opción 'none' ("Soltar") al inicio.
  R2. El avatar puede SOLTAR el objeto: dropHeldItem() vacía la mano, deja el objeto en el piso
      y el botón flotante #btnAwDrop aparece/desaparece según corresponda.
  R3. Columpio: el personaje sigue el péndulo exacto del asiento (x = pivotX - sin(a)*132).
  R4. Z-order: los personajes nunca quedan detrás de muebles/gadgets no ocupados.
  R5. Caras: las reacciones de objetos son temporales y vuelven a la carita elegida en el vestidor.
Uso:  python tools/test_v42_ux_regressions.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_digital_bodies_e2e import DigitalBodiesE2ETestRunner  # noqa: E402


CHECKS_JS = r"""
(() => {
  const g = window.Cinnamo.avatarWorldGame;
  const out = {};
  const av = g.avatars[1];
  av.active = true;

  // R1: miniaturas de la pestaña prop distintas aun con heldItem activo
  av.heldItem = 'cake_stand';
  g.wardrobeTab = 'prop';
  g.openWardrobe(1);
  const tiles = [...document.querySelectorAll('#awSheet .aw-tile')];
  const sigs = tiles.map(t => t.querySelector('canvas').toDataURL());
  out.r1_tileCount = tiles.length;
  out.r1_firstIsNone = tiles[0]?.dataset.val === 'none';
  out.r1_uniqueThumbs = new Set(sigs).size;
  g.closeSheet();
  av.heldItem = null;

  // R2: soltar objeto
  g.applyCustomization(1, 'prop', 'teddy');
  const btn = document.getElementById('btnAwDrop');
  out.r2_btnVisibleWhenHolding = !!btn && !btn.classList.contains('hidden');
  const before = g.getRoomItems().length;
  const dropped = g.dropHeldItem(1, true);
  out.r2_handEmpty = av.propId === 'none' && !av.heldItem;
  out.r2_objectOnFloor = !!dropped && g.getRoomItems().length === before + 1;
  g.updateDropButtonUI();
  out.r2_btnHiddenWhenEmpty = Object.values(g.avatars).some(a => a.active && (a.heldItem || (a.propId && a.propId !== 'none')))
    ? true : btn.classList.contains('hidden');
  // volver a agarrar el objeto soltado
  if (dropped) g.triggerObjectInteraction(dropped, av);
  out.r2_regrab = av.propId === 'teddy';
  // elegir 'none' en el vestidor también limpia heldItem
  av.heldItem = 'watering';
  g.applyCustomization(1, 'prop', 'none');
  out.r2_wardrobeNoneClears = av.propId === 'none' && !av.heldItem;

  // R3: columpio sincronizado
  g.selectRoom(2);
  const swing = g.getRoomItems().find(o => o.type === 'swing');
  g.sitOn(av, swing, false);
  let maxErr = 0;
  for (let i = 0; i < 30; i++) {
    g.update(1 / 30);
    const a = swing.swingAngle || 0;
    const ex = swing.x - Math.sin(a) * 132;
    maxErr = Math.max(maxErr, Math.abs(av.x - ex));
  }
  out.r3_maxSwingErr = maxErr;

  // R4: z-order (avatar de pie siempre después de muebles/gadgets no ocupados)
  av.sittingOn = null;
  g.selectRoom(1);
  av.x = 550; av.y = 400;
  const order = [];
  const origObj = g.drawInteractiveObject.bind(g), origAv = g.drawVectorAvatar.bind(g), origFront = g.drawObjectFrontLayer.bind(g);
  g.drawInteractiveObject = (c, o) => { order.push('o:' + o.id); return origObj(c, o); };
  g.drawObjectFrontLayer = (c, o) => { order.push('f:' + o.id); return origFront(c, o); };
  g.drawVectorAvatar = (c, a, opts) => { if (!opts) order.push('a:' + a.slot); return origAv(c, a, opts); };
  g.draw();
  g.drawInteractiveObject = origObj; g.drawVectorAvatar = origAv; g.drawObjectFrontLayer = origFront;
  const firstAv = order.findIndex(s => s.startsWith('a:'));
  out.r4_noObjectAfterAvatar = firstAv >= 0 && !order.slice(firstAv).some(s => s.startsWith('o:') || s.startsWith('f:'));

  // R5: caras temporales
  g.applyCustomization(1, 'expr', 'starry');
  const perfume = g.getRoomItems().find(o => o.gadget === 'perfume');
  g.triggerObjectInteraction(perfume, av);
  out.r5_reactsLove = av.exprId === 'love';
  for (let i = 0; i < 100; i++) g.update(0.05);
  out.r5_restoredBase = av.exprId === 'starry';
  g.applyCustomization(1, 'expr', 'happy');

  out.errors = (window.__testErrors || []).length;
  return out;
})()
"""


def main():
    r = DigitalBodiesE2ETestRunner()
    ok = True
    try:
        r.start_server()
        r.launch_browser()
        res = r.ws.eval(CHECKS_JS)
        if not isinstance(res, dict) or "__eval_error__" in (res or {}):
            print("FAIL eval:", res)
            return 1
        checks = [
            ("R1 pestaña prop: 'Soltar' primero", res["r1_firstIsNone"]),
            ("R1 pestaña prop: miniaturas todas distintas", res["r1_uniqueThumbs"] == res["r1_tileCount"]),
            ("R2 botón Soltar visible al sostener", res["r2_btnVisibleWhenHolding"]),
            ("R2 mano vacía tras soltar", res["r2_handEmpty"]),
            ("R2 objeto queda en el piso", res["r2_objectOnFloor"]),
            ("R2 botón Soltar se oculta sin objeto", res["r2_btnHiddenWhenEmpty"]),
            ("R2 tocar objeto soltado lo vuelve a agarrar", res["r2_regrab"]),
            ("R2 'none' en vestidor limpia heldItem", res["r2_wardrobeNoneClears"]),
            ("R3 columpio y personaje sincronizados (<0.5px)", res["r3_maxSwingErr"] < 0.5),
            ("R4 ningún objeto se dibuja encima de un avatar de pie", res["r4_noObjectAfterAvatar"]),
            ("R5 reacción temporal 'love'", res["r5_reactsLove"]),
            ("R5 vuelve a la carita elegida", res["r5_restoredBase"]),
            ("0 errores de runtime", res["errors"] == 0),
        ]
        for name, passed in checks:
            ok &= bool(passed)
            print(("[ PASS ] " if passed else "[ FAIL ] ") + name)
        print(f"\nTOTAL: {sum(1 for _, p in checks if p)}/{len(checks)}")
        if not ok:
            print("Detalle:", res)
    finally:
        r.cleanup()
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
