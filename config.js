const topBarCenterText = `XE1CPM - DL70ir`;
// Menu items
// Structure is as follows HTML Color code, Option, target URL, scaling 1=Original Size, side (optional, nothing is Left, "R" is Right)
// The values are [color code, menu text, target link, scale factor, side],
// add new lines following the structure for extra menu options. The comma at the end is important!
const aURL = [
  ["add10d", "BACK", "#", "1"],
  ["add10d", "BACK", "#", "1", "R"],
  ["ff9100", "Refresh", "#", "1"],
  ["0dd1a7", "Help", "#", "1"],
  ["2196F3", "CLUBLOG", "https://clublog.org/livestream/VA3HDL", "1.7"],
  [
    "2196F3",
    "CONTEST",
    "https://www.contestcalendar.com/fivewkcal.html",
    "1",
  ],
  ["2196F3", "DX CLUSTER", "https://dxcluster.ha8tks.hu/map/", "1"],
  [
    "2196F3",
    "LIGHTNING",
    "https://map.blitzortung.org/#3.87/36.5/-89.41",
    "1",
    "R",
  ],
  ["2196F3", "PISTAR", "http://pi-star.local/", "1.2"],
  [
    "2196F3",
    "RADAR",
    "https://weather.gc.ca/?layers=alert,radar&center=43.39961001,-78.53212031&zoom=6&alertTableFilterProv=ON",
    "1",
    "R"
  ],
  ["2196F3", "TIME.IS", "https://time.is/", "1", "R"],
  [
    "2196F3",
    "WEATHER",
    "https://openweathermap.org/weathermap?basemap=map&cities=true&layer=temperature&lat=20.0353&lon=-103.5681&zoom=7",
    "1",
    "R",
  ],
  [
    "2196F3",
    "WINDS",
    "https://earth.nullschool.net/#current/wind/surface/level/orthographic=-106.55,21.15,3000",
    "1",
    "R",
  ],
];

// Dashboard items
// Structure is Title, Image Source URL
// [Title, Image Source URL],
// the comma at the end is important!
// You can't add more items because there are only 12 placeholders on the dashboard
// but you can replace the titles and the images with anything you want.
const aIMG = [
    [
        "RADAR",
        // "https://radar.weather.gov/ridge/standard/CONUS_loop.gif"
        "https://cdn.star.nesdis.noaa.gov/GOES16/ABI/SECTOR/mex/13/GOES16-MEX-13-1000x1000.gif",
    ],
    [
        "CAMS",
        "https://webcamsdemexico.net/nuevovallarta1/live.jpg",
        "https://webcamsdemexico.net/puertovallarta5/live.jpg",
        "https://webcamsdemexico.net/puertovallarta4/live.jpg",
        "https://webcamsdemexico.net/puertovallarta6/live.jpg",
    ],
    [
        "NOAA D-RAP",
        "https://services.swpc.noaa.gov/images/animations/d-rap/global/d-rap/latest.png",
    ],
    [
        "ISS & RS-44 POSITION",
        "https://www.heavens-above.com/orbitdisplay.aspx?icon=iss&width=600&height=300&mode=M&satid=25544",
        "https://www.heavens-above.com/orbitdisplay.aspx?icon=default&width=600&height=300&mode=M&satid=44909",
    ],
    [
        "SATELLITE MX",
        "https://cdn.star.nesdis.noaa.gov/GOES16/GLM/SECTOR/mex/EXTENT3/GOES16-MEX-EXTENT3-1000x1000.gif",
    ],
    [
        "SATELLITE CGL",
        "https://cdn.star.nesdis.noaa.gov/GOES16/GLM/CONUS/EXTENT3/GOES16-CONUS-EXTENT3-625x375.gif",
    ],
    [
        "LIGHTNING",
        "https://images.lightningmaps.org/blitzortung/america/index.php?animation=usa",
    ],
    [
        "SISMIC ACTIVITY",
        "https://ds.iris.edu/seismon/views/eveday_big//imgs/topMap.eveday_big.gif",
    ],
    [
        "GREY LINE",
        "https://www.timeanddate.com/scripts/sunmap.php?iso=now"
    ],
    [
        /*
        "HAMCLOCK",
        "http://127.0.0.1:8080/get_capture.bmp",
        */
       "SUN",
       "https://soho.nascom.nasa.gov/data/LATEST/current_eit_304small.gif",
       "https://soho.nascom.nasa.gov/data/LATEST/current_eit_195small.gif",
       "https://soho.nascom.nasa.gov/data/LATEST/current_c2small.gif",
    ],
    [
        "TROPICAL ACTIVITY",
        "https://www.nhc.noaa.gov/xgtwo/two_pac_0d0.png",
        "https://www.nhc.noaa.gov/xgtwo/two_pac_2d0.png",
        "https://www.nhc.noaa.gov/xgtwo/two_pac_5d0.png",
        "https://www.nhc.noaa.gov/xgtwo/two_pac_7d0.png",
    ],
    [
        "HF PROPAGATION",
        "https://www.hamqsl.com/solar101vhf.php",
        "https://www.hamqsl.com/solar100sc.php",
        "https://www.hamqsl.com/solarpich.php",
    ],
];

// Image rotation intervals in milliseconds per tile - If the line below is commented, all tiles will be rotated every 30000 milliseconds (30s)
// const tileDelay = [11200,10000,11000,10100,10200,10500,10300,10600,10400,10700,10900,10800];
