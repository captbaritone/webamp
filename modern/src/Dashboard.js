import React from "react";
import { objects } from "./maki-interpreter/objects";
import snapshotString from "./__tests__/__snapshots__/objects.test.js.snap";
import methodData from "../resources/maki-skin-data.json";

const methodsSting =
  snapshotString["Maki classes Track unimplemented methods 1"];

const unimplemented = new Set(
  methodsSting.substring(1, methodsSting.length - 2).split("\n")
);

const GREEN = "rgba(0, 255, 0, 0.2)";
const RED = "rgba(255, 0, 0, 0.2)";

let METHOD_COUNT = 0;
let IMPLEMENTED_METHOD_COUNT = 0;

const normalizedMethods = [];
Object.keys(objects).forEach((key) => {
  const makiObject = objects[key];
  makiObject.functions.forEach((method) => {
    METHOD_COUNT++;
    const normalizedName = `${makiObject.name}.${method.name.toLowerCase()}`;
    const implemented = !unimplemented.has(normalizedName);
    if (implemented) {
      IMPLEMENTED_METHOD_COUNT++;
    }
    const foundInSkins = methodData.foundInSkins[normalizedName] || 0;
    const totalCalls = methodData.totalCalls[normalizedName] || 0;
    normalizedMethods.push({
      className: makiObject.name,
      totalCalls,
      foundInSkins,
      methodName: method.name,
      normalizedName,
      implemented,
    });
  });
});

const foundMethods = normalizedMethods.filter(
  (method) => method.foundInSkins > 0
);

function PercentBox({ number, total, label }) {
  const percent = total === 0 ? 1 : number / total;

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: "100px",
          border: "1px solid lightgrey",
          marginRight: "10px",
          textAlign: "center",
          color: "lightgrey",
          position: "relative",
        }}
      >
        {Math.round(percent * 100)}%
        <div
          style={{
            top: "0",
            position: "absolute",
            height: "100%",
            width: `${percent * 100}%`,
            backgroundColor: GREEN,
          }}
        />
      </div>
      <div>
        <span
          style={{
            textDecoration: percent === 1 ? "line-through" : null,
          }}
        >
          {label}
        </span>{" "}
        <span style={{ color: "lightgrey" }}>
          ({number}/{total})
        </span>
      </div>
    </div>
  );
}

export default function () {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortKey, setSortKey] = React.useState("totalCalls");
  const [sortDirection, setSortDirection] = React.useState("ASC");
  function setOrToggleSort(key) {
    if (sortKey === key) {
      setSortDirection((dir) => (dir === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortKey(key);
    }
  }

  const sortAscending = (a, b) => (b[sortKey] > a[sortKey] ? 1 : -1);
  const sortDecending = (a, b) => (b[sortKey] < a[sortKey] ? 1 : -1);
  const sortFunction = sortDirection === "ASC" ? sortAscending : sortDecending;

  let filterFunction = () => true;
  if (searchQuery) {
    const normalizedQuery = searchQuery.toLowerCase();

    filterFunction = (method) => {
      return method.normalizedName.toLowerCase().includes(normalizedQuery);
    };
  }
  return (
    <div style={{ padding: "20px" }}>
      <h1>Are Modern Skins Ready Yet?</h1>
      <PercentBox
        number={IMPLEMENTED_METHOD_COUNT}
        total={METHOD_COUNT}
        label="All Methods"
      />
      <PercentBox
        number={foundMethods.filter((method) => method.implemented).length}
        total={foundMethods.length}
        label="Used Methods"
      />
      <input
        placeholder={"Search..."}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th onClick={() => setOrToggleSort("implemented")}>Status</th>
            <th onClick={() => setOrToggleSort("className")}>Class</th>
            <th onClick={() => setOrToggleSort("methodName")}>Method Name</th>
            <th onClick={() => setOrToggleSort("foundInSkins")}>
              Found In Skins
            </th>
            <th onClick={() => setOrToggleSort("totalCalls")}>Total Calls</th>
          </tr>
        </thead>
        <tbody>
          {normalizedMethods
            .sort(sortFunction)
            .filter(filterFunction)
            .map(
              ({
                className,
                methodName,
                foundInSkins,
                totalCalls,
                implemented,
              }) => {
                return (
                  <tr key={className + methodName}>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "10px",
                          border: "1px solid lightgrey",
                          backgroundColor: implemented ? GREEN : RED,
                        }}
                      />
                    </td>
                    <td>{className}</td>
                    <td>{methodName}</td>
                    <td>{foundInSkins}</td>
                    <td>{totalCalls}</td>
                  </tr>
                );
              }
            )}
        </tbody>
      </table>
    </div>
  );
}
