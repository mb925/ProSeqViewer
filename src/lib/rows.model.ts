import {Palettes} from './palettes';
import {ColorsModel} from './colors.model';

export class RowsModel {
  substitutiveId = 99999999999999;

  private processRows(rows, icons, regions, opt) {

    const allData = [];

    // decide which color is more important in case of overwriting
    const coloringOrder = ['custom', 'clustal', 'zappo', 'gradient', 'binary'];

    // order row Numbers
    const rowNumsOrdered = Object.keys(rows).map(Number).sort((n1, n2) => n1 - n2);

    // order keys of Row object
    const ordered = {};
    for (const rowNum of rowNumsOrdered) {
      ordered[rowNum] = Object.keys(rows[+rowNum]).map(Number).sort((n1, n2) => n1 - n2);
    }

    let data;
    let coloringRowNums;
    let tmp;
    // loop through data rows
    for (const rowNum of rowNumsOrdered) {
      tmp = ordered[rowNum];
      // data key: indexes, value: chars
      data = rows[rowNum];
      // data[rowNum].label = this.rows.getLabel(rowNum, this.sequences);
      // console.log(data)
      if (regions) {
        for (const coloring of coloringOrder.reverse()) {
          coloringRowNums = ColorsModel.getRowsList(coloring).map(Number);
          // if there is coloring for the data row
          if (coloringRowNums.indexOf(rowNum) < 0) {
            // go to next coloring
            continue;
          }

          const positions = ColorsModel.getPositions(coloring, rowNum);
          // positions = start, end, target (bgcolor || fgcolor)
          if (positions.length > 0) {
            for (const e of positions) {
              for (let i = e.start; i <= e.end; i++) {
                if (!data[i]) {
                  continue;
                }

                if (e.backgroundColor && !e.backgroundColor.startsWith('#')) { // is a palette
                  if (e.backgroundColor == 'custom') {
                    data[i].backgroundColor = opt.customPalette[data[i].char];
                  } else {
                    data[i].backgroundColor = Palettes[e.backgroundColor][data[i].char]; // e.backgroundcolor = zappo, clustal..
                  }
                } else {
                  data[i].backgroundColor = e.backgroundColor; // is a region or pattern
                }
                data[i].target = e.target + 'background-color:' + data[i].backgroundColor;
              }
            }
          }
        }
        if (icons !== {}) {
          const iconsData = icons[rowNum];
          if (iconsData) { allData.push(iconsData); }
        }
      }
      allData.push(data);
    }
    return allData;
  }

  process(sequences, icons, regions, opt) {

    // check and set global sequenceColor
    if (opt && opt.sequenceColor) {
      // @ts-ignore
      for (const sequence of sequences) {
        if (!sequence.sequenceColor) {
          sequence.sequenceColor = opt.sequenceColor;
        }
      }
    }

    // keep previous data
    if (!sequences) { return; }

    // reset data
    const rows = {};

    // check if there are undefined or duplicate ids and prepare to reset them
    const values = [];
    let undefinedValues = 0;

    for (const r of Object.keys(sequences)) {

      if (isNaN(+sequences[r].id)) {
        // missing id
        undefinedValues += 1;
        sequences[r].id = this.substitutiveId;
        this.substitutiveId -= 1;
        // otherwise just reset missing ids and log the resetted id
      } else {
        if (values.includes(+sequences[r].id)) {
          // Duplicate sequence id
          delete sequences[r];
        } else {
          values.push(+sequences[r].id);
        }
      }
    }

    for (const row of Object.keys(sequences)) {

      /** check sequences id type */
      let id;
      if (isNaN(+sequences[row].id)) {
        id = values.sort()[values.length - 1] + 1;
      } else {
        id = sequences[row].id;
      }

      /** set row chars */
      rows[id] = {};
      for (const idx of Object.keys(sequences[row].sequence)) {
        const idxKey = (+idx + 1).toString();
        const char = sequences[row].sequence[idx];
        rows[id][idxKey] = {char};
      }
    }
    return this.processRows(rows, icons, regions, opt);
  }
}
