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

const utcNow = new Date();
const utcHour = utcNow.toISOString().slice(11, 13);

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
        // Not working any more
        //"https://webcamsdemexico.net/puertovallarta6/live.jpg",
    ],
    [
        "NOAA D-RAP",
        "https://services.swpc.noaa.gov/images/animations/d-rap/global/d-rap/latest.png",
       /*"SW BROADCAST",
       "http://www.short-wave.info/php/transmitter-site-map.php?mobile=false&lat=29.65|29.65|-21.96|-15.53|46.34|50.73|36.28|-21.96|16.87|29.65|50.89|24.88|43.51|29.65|29.65|52.67|46.34|22.79|29.65|21.14|39.36|29.50|29.50|-38.83|27.46|46.34|27.46|25.19|27.46|36.28|35.82|39.75|35.82|21.14|22.79|40.08|36.21|40.08|18.22|21.14|29.11|39.36|39.36|21.93|36.21|39.36|36.21|44.15|30.65|-21.96|42.04|39.91|27.46|36.28|36.21|27.46&lon=91.25|91.25|27.60|28.00|-67.83|4.39|-86.10|27.64|96.16|91.25|-113.85|102.49|-79.63|91.25|91.25|9.75|-67.83|108.19|91.25|105.42|75.72|90.98|90.98|176.42|-80.93|-67.83|-80.93|121.42|-80.93|-86.10|126.87|116.81|126.87|105.42|108.19|126.11|-86.89|126.11|-63.02|105.42|119.31|75.72|75.72|59.63|-86.89|75.72|-86.89|86.90|-87.09|27.64|12.32|-76.58|-80.93|-86.10|-86.89|-80.93&freq=4905|4920|4930|4965|5130|5780|5920|5940|5985|6025|6030|6060|6070|6110|6130|6160|6160|6175|6200|7220|7235|7255|7385|7440|7730|9330|9395|9405|9455|9475|9515|9570|9640|9730|9880|9890|9980|11645|11775|11885|11900|11940|11965|12095|12160|13760|13845|15250|15555|15580|15595|15750|15770|15810|15825|17790&az=ND|ND|20|ND|245|ND|50|350|176|268|ND|163|ND|220|290|ND|245|200|85|290|173|85|290|35|44|245|355|225|285|50|304|257|225|320|200|296|90|296|320|320|255|294|298|10|85|308|90|270|5|350|107|62|44|40|46|160",
       */
    ],
        /*
    [
        "Noticias en Vivo",
        "iframe|https://www.youtube.com/embeded/Io5mt83nCcU?autoplay=1&mute=1",
        "ISS & RS-44 POSITION",
        "https://www.heavens-above.com/orbitdisplay.aspx?icon=default&width=600&height=300&mode=M&satid=44909",
        "https://www.heavens-above.com/orbitdisplay.aspx?icon=iss&width=600&height=300&mode=M&satid=25544",
    ],
        */
    ["LIVE NEWS", "iframe|https://www.youtube.com/embed/Io5mt83nCcU?si=Salfka3l8qHfX16m&autoplay=1&mute=1"],
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
       //"SUN",
       //"https://soho.nascom.nasa.gov/data/LATEST/current_eit_304small.gif",
       //"https://soho.nascom.nasa.gov/data/LATEST/current_eit_195small.gif",
       //"https://soho.nascom.nasa.gov/data/LATEST/current_c2small.gif",
       " ",
       "https://img.propagation.dr2w.de/n-america/10M/dr2w_10M_" + utcHour + ".png",
       "https://img.propagation.dr2w.de/n-america/20M/dr2w_20M_" + utcHour + ".png",
       "https://img.propagation.dr2w.de/n-america/40M/dr2w_40M_" + utcHour + ".png",
    ],
    [
        "TROPICAL ACTIVITY",
        "https://www.nhc.noaa.gov/xgtwo/two_pac_0d0.png",
        // "https://www.nhc.noaa.gov/xgtwo/two_pac_2d0.png",
        // "https://www.nhc.noaa.gov/xgtwo/two_pac_5d0.png",
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
const tileDelay = [3600000,10000,11000,7200000,3600000,3600000,10300,10600,10400,3600000,10900,10800];
