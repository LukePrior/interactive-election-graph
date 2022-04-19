import "./styles.css";
import React from "react";
import { GG, Labels } from "@graphique/gg";
import { GeomPoint } from "@graphique/geom-point";
import { GeomSmooth } from "@graphique/geom-smooth";
import moment from "moment";

const dataUrl1 =
  "https://www.wikitable2json.com/api/Opinion_polling_for_the_2022_Australian_federal_election?table=1&format=keyValue&lang=en&cleanRef=true";
const dataUrl2 =
  "https://www.wikitable2json.com/api/Opinion_polling_for_the_2022_Australian_federal_election?table=0&format=keyValue&lang=en&cleanRef=true";

const graphTitle = (
  <div
    style={{
      fontWeight: 700,
      fontSize: 14,
      marginBottom: 20,
      display: "flex",
      alignItems: "center"
    }}
  >
    Australian 2022 Federal Election Opinion Polling
  </div>
);

const pollIdentifier = (d) => {
  return `${d.date}-${d.party}-${d.brand}-${d.size}`;
};

const brandParty = (d) => {
  return `${d.brand} ${d.party}`;
};

function process_data(result) {
  var formatted = [];
  var data;
  data = result;
  for (const poll of data) {
    var percentage = parseFloat(poll["2pp vote"]);

    var brand = poll["Brand"];

    var date = poll["Date"].split("–");
    date = date.pop();
    date = moment(date);

    var size = parseInt(poll["Sample size"]);

    if (!isNaN(percentage) && brand != "" && date.isValid()) {
      var temp = {};
      temp.party = "labor";
      temp.vote = percentage;
      temp.brand = brand;
      temp.date = date.utc().valueOf();
      if (!isNaN(size)) {
        temp.size = size;
      }
      formatted.push(temp);
      var temp = {};
      temp.party = "liberal";
      temp.vote = 100 - percentage;
      temp.brand = brand;
      temp.date = date.utc().valueOf();
      if (!isNaN(size)) {
        temp.size = size;
      }
      formatted.push(temp);
    }
  }
  return formatted;
}

function App() {
  const [obj, setObj] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
      fetch(dataUrl1).then((value) => value.json()),
      fetch(dataUrl2).then((value) => value.json())
    ]).then((value) => {
      setObj(process_data(value[0][0].concat(value[1][0])));
    });
  }, []);

  return (
    <div
      style={{
        maxWidth: 1100
      }}
    >
      <GG
        data={obj}
        aes={{
          x: (d) => new Date(d.date),
          y: (d) => d.vote,
          key: pollIdentifier,
          fill: brandParty,
          label: brandParty
        }}
        margin={{
          left: 35
        }}
        useParentWidth
        height={500}
      >
        <GeomSmooth se />
        <GeomPoint size={3.4} opacity={0.4} />
        <Labels y="Voters (%)" x="Date" title={graphTitle} />
      </GG>
    </div>
  );
}

export default App;
