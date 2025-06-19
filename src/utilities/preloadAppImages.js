import player from "/player.webp";
import all from "/carousal/all.webp";
import classical from "/carousal/classical.webp";
import country from "/carousal/country.webp";
import dance from "/carousal/dance.webp";
import jazz from "/carousal/jazz.webp";
import pop from "/carousal/pop.webp";
import rock from "/carousal/rock.webp";
import disco from "/carousal/disco.webp";
import house from "/carousal/house.webp";
import retro from "/carousal/retro.webp";
import ska from "/carousal/ska.webp";
import blues from "/carousal/blues.webp";
import reggae from "/carousal/reggae.webp";
import favSmall from "../images/logos/favicon_32x32.png";
import favLarge from "../images/logos/favicon_64x64.png";
import favMd from "../images/logos/favicon_48x48.png";
import logoBlack from "../images/logos/SoundPulse_black.png";
import logolGreen from "../images/logos/SoundPulse_green.png";
import logoSignet from "../images/logos/SoundPulse_signet.png";

export const appImages = {
  player: player,
  all: all,
  classical: classical,
  country: country,
  dance: dance,
  jazz: jazz,
  pop: pop,
  rock: rock,
  disco: disco,
  house: house,
  retro: retro,
  ska: ska,
  blues: blues,
  reggae: reggae,
  favSmall: favSmall,
  favLarge: favLarge,
  favMd: favMd,
  logoBlack: logoBlack,
  logoGreen: logolGreen,
  logoSignet: logoSignet,
};

export const preloadAppImages = (imagePaths) => {
  return Promise.all(
    imagePaths.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    })
  );
};
