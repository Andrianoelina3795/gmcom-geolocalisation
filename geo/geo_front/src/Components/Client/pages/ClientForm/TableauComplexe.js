import React from 'react';
import './TableauComplexe.css';

const TableauComplexe = () => {
  return (
    <div className="table-container">
      <table className="sanitary-table">
        <tbody>
          <tr>
            <th rowSpan="2">Toilette</th>
            <th>Fosse</th>
            <th>Plate-forme</th>
            <th>Source d’eau</th>
            <th>Aucune</th>
          </tr>
          <tr>
            <td contentEditable></td>
            <td contentEditable></td>
            <td contentEditable></td>
            <td contentEditable></td>
          </tr>
          <tr>
            <th rowSpan="2">Puit/Forage</th>
            <th>Simple</th>
            <th>Motorisé</th>
            <th>Autre</th>
            <th>Aucune</th>
          </tr>
          <tr>
            <td contentEditable></td>
            <td contentEditable></td>
            <td contentEditable></td>
            <td contentEditable></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TableauComplexe;
