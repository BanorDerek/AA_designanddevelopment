// components/LoadingScreen.jsx
import { useEffect, useState } from 'react';
import { preloadHomeImages } from '../utils/imagePreloader';
import './LoadingScreen.css';

export default function LoadingScreen({ onComplete }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let startTime = Date.now();
    const MIN_DISPLAY_TIME = 3000;

    const startPreload = async () => {
      console.log('🔄 Starting image preload...');

      try {
        await preloadHomeImages((progress) => {
          if (isMounted) {
            setProgress(progress * 100);
          }
        });
        console.log('✅ All images preloaded');
      } catch (error) {
        console.error('❌ Image preload failed:', error);
      }

      if (isMounted) {
        setIsLoadingComplete(true);

        // Calculate how much time has passed
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

        console.log(`⏱️ Loading took ${elapsedTime}ms, waiting ${remainingTime}ms more`);

        // Wait for remaining time before exiting
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => {
            onComplete?.();
          }, 800);
        }, remainingTime);
      }
    };

    startPreload();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  useEffect(() => {
    const handleResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { w, h } = size;
  const cx = w / 2;
  const cy = h / 2;
  const maxDimension = Math.min(w, h) * 0.8;
  const svgSize = Math.min(maxDimension, 1200);

  return (
    <div className={`loader ${exiting ? 'loader--exit' : ''}`}>
      {/* SVG now does BOTH the mask definition AND the masked rect itself.
          Native SVG masking (mask="url(#id)" on an SVG element) is what
          real mobile browsers support reliably — CSS mask-image on an
          HTML element referencing this same mask is what was failing on
          real devices (DevTools mobile emulation runs the desktop engine,
          which is more lenient, so it looked fine there). */}
      <svg
        className="loader__mask-svg"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
      >
        <defs>
          <mask id="loaderPeepMask" maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            {/* White background - everything visible by default */}
            <rect x="0" y="0" width={w} height={h} fill="white" />
            {/* Black shapes - these will be cut out (transparent) */}
            <g transform={`translate(${cx - svgSize/2}, ${cy - svgSize/2}) scale(${svgSize/2048})`}>
              {/* Left "A" main shape - black = cut out (shows background) */}
              <path fill="black" d="M 520.172 223.64 C 523.308 224.209 528.836 226.029 532.088 226.986 L 833.56 1005.69 L 930.688 1257.12 L 962.708 1340.74 C 967.659 1353.39 974.163 1371.33 980.021 1383.18 L 897.452 1383.77 C 893.825 1369.58 885.163 1351.11 879.612 1336.61 C 859.286 1283.5 836.805 1230.99 816.61 1177.81 C 809.086 1158 796.676 1134.66 793.852 1114.16 C 748.816 1113.2 746.22 1118.02 705.003 1133.88 L 598.562 1175.49 C 585.01 1180.91 571.382 1186.13 557.681 1191.16 C 547.328 1194.98 533.574 1199.5 524.132 1204.72 L 522.945 1205.18 C 519.884 1206.33 515.619 1208 512.429 1206.85 C 502.85 1203.41 492.59 1198.98 483.156 1195.13 C 463.424 1187.08 443.628 1179.2 423.77 1171.48 L 308.4 1126.32 C 293.859 1120.68 275.843 1115.47 262.265 1109.28 C 248.09 1131.95 236.231 1167.37 226.068 1193.16 L 171.77 1330.23 C 164.472 1348.36 160.24 1368.16 147.749 1382.91 C 127.514 1383.54 88.1383 1381.01 69.7087 1384.01 C 75.34 1365.57 84.1164 1346.04 91.1032 1327.81 L 140.201 1200.25 L 324.256 724.571 L 451.896 394.971 L 494.565 284.676 C 502.105 265.635 511.188 241.467 520.172 223.64 z"/>

              {/* Left "A" notch/cutout - white = keep background visible */}
              <path fill="white" d="M 520.981 433.308 C 531.71 440.39 598.783 619.777 608.536 644.675 L 730.563 953.675 C 739.663 976.81 751.898 1012.64 761.89 1033.94 C 687.521 1036.76 603.598 1034.93 528.212 1034.93 C 448.794 1034.97 366.396 1036.14 287.216 1034.61 L 432.935 664.631 L 481.717 540.074 C 496.708 501.868 509.034 472.902 520.981 433.308 z"/>

              {/* Right "A" main shape - black = cut out (shows background) */}
              <path fill="black" d="M 1014.05 781.887 C 1040.82 782.787 1064.61 783.138 1091.47 782.174 C 1106.17 803.563 1123.88 855.542 1134.66 882.054 C 1153.76 928.801 1172.49 975.699 1190.85 1022.74 C 1195.34 1033.94 1200.89 1044.24 1205.09 1055.01 C 1244.46 1050.74 1283.83 1027.03 1322.13 1013.8 C 1366.65 998.426 1418.76 972.575 1465.17 962.466 C 1472.96 960.77 1501.13 974.243 1510.42 977.896 L 1643.94 1030.13 C 1676.69 1042.67 1695.1 1053.92 1731.08 1054.62 C 1740.52 1034.31 1750.71 1005.55 1759.21 984.026 L 1811.4 853.345 C 1820.64 830.412 1827.78 805.007 1840.54 784.424 C 1860.52 783.608 1901.51 785.733 1918.71 781.975 C 1913.87 793.882 1909.18 808.191 1904.64 820.449 L 1879.6 886.955 L 1817.26 1048.83 L 1728.82 1279.24 C 1719.68 1303.36 1709.07 1328.72 1700.47 1352.74 C 1668.46 1431.37 1638.55 1514.77 1607.72 1594.13 C 1562.91 1706.98 1519.5 1820.39 1477.51 1934.32 C 1469.25 1935.57 1462.65 1938.22 1458.86 1928.8 C 1444.68 1893.63 1431.64 1858.04 1418.15 1822.61 L 1342 1624.29 L 1161.63 1161.91 C 1113.12 1034.98 1063.92 908.298 1014.05 781.887 z"/>

              {/* Right "A" notch/cutout - white = keep background visible */}
              <path fill="white" d="M 1233.11 1133.18 C 1254.18 1132.71 1276.03 1133.34 1297.23 1133.25 L 1483.85 1133.05 L 1612 1133.33 C 1641.65 1133.35 1670.88 1132.52 1700.53 1133.89 C 1686.06 1179.66 1662.45 1234.65 1644.59 1280.45 L 1535.02 1559.94 C 1518.33 1604 1499.56 1647.53 1483.28 1691.8 C 1478.79 1704.01 1472.13 1716.54 1466.25 1728.2 C 1449.65 1676.07 1424.21 1616.1 1403.92 1564.32 L 1294.14 1287.32 L 1253.86 1184.68 C 1250.34 1175.95 1234.43 1139.59 1233.11 1133.18 z"/>

              {/* Decorative circle - black = cut out (shows background) */}
              <path fill="black" d="M 977.399 1021.7 C 1013.55 1013.7 1049.33 1036.61 1057.18 1072.79 C 1065.04 1108.98 1041.99 1144.66 1005.78 1152.37 C 969.764 1160.04 934.331 1137.15 926.517 1101.17 C 918.704 1065.19 941.451 1029.66 977.399 1021.7 z"/>
            </g>
          </mask>
        </defs>

        {/* The actual visible masked rectangle — lives inside the SVG and
            uses the native SVG mask attribute, not CSS mask-image. */}
        <rect
          className="loader__scrim-rect"
          x="0"
          y="0"
          width={w}
          height={h}
          fill="#B2A881"
          mask="url(#loaderPeepMask)"
        />
      </svg>

      <span className="sr-only">Loading</span>
    </div>
  );
}