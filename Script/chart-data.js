var chart_data = {};

chart_data["01-private-late"] = {
    title:"late-stage venture capital funding in cleantech",
    href:"Notes/01-private.txt",
    source:"PricewaterhouseCoopers Cleantech MoneyTree Report",
    format: function (x) { return sprintf("$%.1f B", x/1000); },
    labelWidth: 66,
    topValue:3806.5 - 890.0,
    bars: [
        ["2009", 2481.8 - 619.2 ],
        ["2010", 3806.5 - 890.0 ],
        ["2011", 4278.2 - 1386.6 ],
        ["2012", 2754.3 - 574.8 ],
        ["2013", 1379.9 - 252.9 ],
        ["2014", 1980.1 - 142.3 ],
    ],
};

chart_data["01-private-early"] = {
    title:"early-stage venture capital funding in cleantech",
    href:"Notes/01-private.txt",
    source:"PricewaterhouseCoopers Cleantech MoneyTree Report",
    format: function (x) { return sprintf("$%.1f B", x/1000); },
    labelWidth: 66,
    topValue:3806.5 - 890.0,
    bars: [
        ["2009", 619.2  ],
        ["2010", 890.0  ],
        ["2011", 1386.6,  { "annotation":"(peak)" } ],
        ["2012", 574.8,  { "annotation":"(crash)" } ],
        ["2013", 252.9  ],
        ["2014", 142.3, { "annotation":"(all but disappeared)" } ],
    ],
};

chart_data["02-pollutants"] = {
    title:"contribution to global warming from things dumped into the sky",
    href:"Notes/02-pollutants.jpg",
    source:"Al Gore. Our Choice, p 47",
    format: "%d%%",
    topValue: 87,
    labelWidth: 124,
    bars: [
        [ "carbon dioxide (CO2)", 43 ],
        [ "methane (CH4)", 27 ],
        [ "black carbon (soot)", 12 ],
        [ "halocarbons", 8 ],
        [ "CO and VOCs", 7 ],
        [ "nitrous oxide (N2O)",  4 ],
    ],
};

chart_data["02-sources"] = {
    title:"human sources of carbon dioxide",
    href:"http://whatsyourimpact.org/greenhouse-gases/carbon-dioxide-sources",
    format: "%d%%",
    topValue: 87,
    labelWidth: 124,
    bars: [
        [ "burning fossil fuels", 87 ],
        [ "land use changes", 9, { "annotation":"(primarily deforestation, primarily for agriculture)" } ],
        [ "industrial processes",  4 ],
    ],
};

chart_data["02-solar-land"] = {
    title:"percent of land in continental U.S.",
    href:"Notes/02-solar-land.txt",
    format: function (x) { return sprintf("%.1f%%", (x / 2300000) * 100); },
    labelWidth: 240,
    bars: [
        [ "land devoted to agriculture", 1173000 ],
        [ "land required for solar to provide all U.S. energy", 53400, ],
        [ "land required for solar to provide U.S. electricity", 17300, 
            { "annotation":"(excluding cars, heating, etc.)" } ],
        [ "land devoted to roads", 17929 ],
    ],
};

chart_data["02-solarcost"] = {
    title:"breakdown of solar cost per watt, 2014-2017 (projected)",
    href:"http://www.qualenergia.it/sites/default/files/articolo-doc/Solar%202015%20Outlook(1).pdf",
    comment:"figure 26: cost reduction example",
    format: function (x) { return sprintf("$%.2f", x / 100); },
    topValue: 290,
    labelWidth: 58,
    lineHeight: 14,
    labels: [ "panel", "inverter", "rack", "BoS", "installation", "sales", "other" ],
    chart:"stacked",
    bars: [
        [ "2014", [ 75, 25, 25, 30, 65, 50, 20 ] ],
        [ "2015", [ 70, 23, 23, 25, 60, 47, 18 ] ],
        [ "2016", [ 65, 20, 19, 20, 45, 30, 16 ] ],
        [ "2017", [ 50, 17, 16, 17, 45, 20, 12 ] ],
    ]
};


var transportationPixelsPerValue = 0.017;

chart_data["04-sectors"] = {
    title:"U.S. energy consumption, 2014",
    page:"https://flowcharts.llnl.gov",
    href:"https://flowcharts.llnl.gov/content/assets/images/energy/us/Energy_US_2014.png",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(Math.round(100*x/sum))); },
    pixelsPerValue: transportationPixelsPerValue,
    labelWidth: 94,
    bars: [
        [ "transportation", 27100, { "class":"transportation" } ],
        [ "manufacturing", 24700, { "class":"manufacturing" } ],
        [ "residential", 11800, { "class":"residential" } ],
        [ "commercial", 8930, { "class":"commercial" } ],
    ],
};

chart_data["04-residential"] = {
    title:"residential breakdown",
    icon:'<img style="margin-right:1px;" src="Images/04-icon-residential.svg" width="20" height="20">',
    href:"http://www.eia.gov/consumption/residential/data/2009/index.cfm?view=consumption",
    page:"http://www.eia.gov/consumption/data.cfm#rec",
    comment:"CE3.1",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(100*x/sum)); },
    pixelsPerValue: transportationPixelsPerValue,
    scaleToSum: 11800,
    labelWidth: 94,
    rectClass: "residential",
    bars: [
        [ "space heating", 4226 ],
        [ "water heating", 1803 ],
        [ "air conditioning", 635 ],
        [ "refrigerators", 484 ],
        [ "other", 3035 ],
    ],
};

chart_data["04-commercial"] = {
    title:'commercial breakdown',
    icon:'<img style="margin-left:-7px;margin-right:2px;" src="Images/04-icon-commercial.svg" width="20" height="20">',
    href:"http://www.eia.gov/consumption/commercial/data/2003/pdf/e01a.pdf",
    page:"http://www.eia.gov/consumption/data.cfm#cec",
    comment:"Table E1A",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(100*x/sum)); },
    pixelsPerValue: transportationPixelsPerValue,
    scaleToSum: 8930,
    labelWidth: 94,
    rectClass: "commercial",
    bars: [
        [ "space heating", 2365 ],
        [ "lighting", 1340 ],
        [ "cooling", 516 ],
        [ "water heating", 501 ],
        [ "ventilation", 436 ],
        [ "refrigeration", 381 ],
        [ "cooking", 190 ],
        [ "computers", 156 ],
        [ "office equipment", 69 ],
        [ "other", 569 ],
    ],
};

chart_data["04-manufacturing"] = {
    title:'manufacturing breakdown',
    icon:'<img src="Images/04-icon-manufacturing.svg" width="20" height="20">',
    page:"http://www.eia.gov/consumption/data.cfm#mfg",
    href:"http://www.eia.gov/consumption/manufacturing/data/2010/pdf/Table1_1.pdf",
    comment:"Table 1_1",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(100*x/sum)); },
    pixelsPerValue: transportationPixelsPerValue,
    scaleToSum: 24700,
    labelWidth: 154,
    rectClass: "manufacturing",
    bars: [
        [ "petroleum and coal products", 6137 ],
        [ "chemicals", 4995 ],
        [ "paper", 2109 ],
        [ "primary metals", 1608 ],
        [ "food", 1162 ],
        [ "nonmetallic mineral products", 716 ],
        [ "wood products", 473 ],
        [ "fabricated metal products", 302 ],
        [ "transportation equipment", 279 ],
        [ "plastics and rubber products", 275 ],
        [ "other", 760 ],
    ],
};

chart_data["04-transportation"] = {
    title:'transportation breakdown',
    icon:'<img style="margin-top:-5px; margin-right:4px;" src="Images/04-icon-transportation.svg" width="25" height="25">',
    page:"http://cta.ornl.gov/data/chapter2.shtml",
    href:"http://cta.ornl.gov/data/tedb34/Spreadsheets/Table2_08.xls",
    comment:"Table 2.8 Transportation Energy Use by Mode, 2012–2013",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(100*x/sum)); },
    pixelsPerValue: transportationPixelsPerValue,
    scaleToSum: 27100,
    labelWidth: 84,
    rectClass: "transportation",
    bars: [
        [ "cars", 7046.6 ],
        [ "light trucks", 8076.9 ],
        [ "heavy trucks", 5923.8 ],
        [ "air", 2037 ],
        [ "water", 1054.9 ],
        [ "rail", 610.8 ],
        [ "pipeline", 1140.8 ],
    ],
};


chart_data["04-transportation-CO2"] = {
    title:"transportation-related CO<sub>2</sub> emissions in U.S., 2013",
    href:"http://cta.ornl.gov/data/tedb34/Edition34_Chapter11.pdf",
    comment:"table 11.8: Transportation Carbon Dioxide Emissions by Mode, 1990–2013",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(100*x/sum)); },
    topValue: 1032,
    labelWidth: 114,
    bars: [
        [ "passenger vehicles", 1032 ],
        [ "heavy trucks", 410.8 ],
        [ "air", 148.6 ],
        [ "rail", 44.4 ],
        [ "water", 38.8 ],
        [ "pipeline",  47.7 ],
    ],
};

chart_data["04-ev-grid"] = {
    title:"well-to-wheels greenhouse gas emissions per vehicle, in CO<sub>2</sub>-equiv tons per year",
    href: "http://www.afdc.energy.gov/vehicles/electric_emissions.php",
    format: "%.1f",
    labelWidth: 154,
    bars: [
        [ "gasoline car", 14815 / 2000 ],
        [ "electric car in Illinois", 9074 / 2000 ],
        [ "electric car, U.S. average", 7657 / 2000 ],
        [ "electric car in California", 4152 / 2000 ],
        [ "electric car in New York", 3431 / 2000 ],
        [ "electric car, 100% renewables", 0 ],
    ],
};

chart_data["04-trip-distribution"] = {
    title:"distribution of U.S. car trips",
    href: "http://www.solarjourneyusa.com/EVdistanceAnalysis7.php",
    format: " ",
    labelWidth: 40,
    lineHeight: 3,
    barHeight: 2,
    barYOffset: 7,
    fullHeight: 180,
    bars: [
        [ " 0 miles", 208 ],
        [ "", 241 ],
        [ "", 266 ],
        [ "", 215 ],
        [ "", 157 ],
        [ "", 157 ],
        [ "", 104 ],
        [ "", 90  ],
        [ "", 79  ],
        [ "", 45  ],
        [ "10 miles", 83  ],
        [ "", 30  ],
        [ "", 52  ],
        [ "", 27  ],
        [ "", 24  ],
        [ "", 56  ],
        [ "", 19  ],
        [ "", 20  ],
        [ "", 21  ],
        [ "", 9   ],
        [ "20 miles", 34  ],
        [ "", 10  ],
        [ "", 12  ],
        [ "", 10  ],
        [ "", 8   ],
        [ "", 22  ],
        [ "", 8   ],
        [ "", 7   ],
        [ "", 7   ],
        [ "", 4   ],
        [ "30 miles", 17  ],
        [ "", 3   ],
        [ "", 6   ],
        [ "", 4   ],
        [ "", 4   ],
        [ "", 10  ],
        [ "", 4   ],
        [ "", 3   ],
        [ "", 3   ],
        [ "", 1   ],
        [ "40 miles", 8   ],
        [ "", 1   ],
        [ "", 3   ],
        [ "", 2   ],
        [ "", 0   ],
        [ "", 6   ],
        [ "", 0   ],
        [ "", 1   ],
        [ "", 0   ],
        [ "", 0   ],
        [ "50 miles", 6   ],
    ],
};

chart_data["04-truck-emissions"] = {
    title:"long-haul truck emissions in ten years, under different tech adoption scenarios",
    href: "http://www.grahampeacedesignmail.com/cwr/cwr2012_trucking_finall_download_singles.pdf",
    source: "Road Transport: Unlocking Fuel-Saving Technologies In Trucking And Fleets, Nov 2012, figure 5",
    format: function (x) { return sprintf("%d%%", Math.round(100*x)); },
    labelWidth: 126,
    bars: [
        [ "business as usual", 394698 / 306034 ],  //  ktons CO2, 2021 value / 2011 value
        [ "base tech adoption", 370619 / 306034 ],
        [ "aggressive adoption", 359817 / 306034 ],
        [ "complete adoption", 310084 / 306034 ],
        [ "and better logistics", 274304 / 306034 ],
    ],
};

chart_data["04-residential-electricity"] = {
    title:"residential electricity consumption in U.S.",
    href: "http://www.eia.gov/tools/faqs/faq.cfm?id=96&t=3",
    format: function (x,i,sum) { return sprintf("%d%%", Math.round(100*x/sum)); },
    labelWidth: 98,
    bars: [
        [ "space cooling", 0.64 ],
        [ "lighting", 0.51 ],
        [ "water heating", 0.45 ],
        [ "space heating", 0.45 ],
        [ "refrigeration", 0.36 ],
        [ "television etc", 0.33 ],
        [ "clothes dryers", 0.20 ],
        [ "furnace fans etc", 0.15 ],
        [ "other", 1.74 ],
    ],
};

chart_data["04-per-capita"] = {
    title: "per capita electricity use in MWh",
    href: "http://www.arb.ca.gov/research/seminars/chu/chu.pdf",
    lines: [
        { label:"California",
          units: "kWh",
          values: [ 3632, 3754, 3799, 3920, 4238, 4435, 4813, 5040, 5388, 5645, 5933, 6175, 6554, 6690, 6190, 6886, 7098, 7083, 7098, 7280, 7008, 7144, 6826, 6796, 7174, 7280, 7114, 7295, 7477, 7522, 7613, 7265, 7310, 7250, 7295, 7280, 7492, 7613, 7431, 7568, 7719, 7280 ],
        },
        { label:"U.S.",
          units: "kWh",
          values: [3814, 3935, 4177, 4419, 4677, 4919, 5282, 5555, 6024, 6508, 6826, 7098, 7598, 8082, 7976, 8082, 8521, 8854, 9066, 9202, 9232, 9338, 8990, 9187, 9671, 9762, 9853, 10125, 10534, 10701, 10897, 10943, 10822, 11094, 11261, 11457, 11669, 11715, 11972, 12123, 12411, 12214],
        },
    ],
    domain: [ 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001 ],
};


