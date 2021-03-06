
export class PatternsModel {

  // find index of matched regex positions and create array of regions with color
  process(patterns, sequences) {
    if (!patterns) { return }
    const regions = []; // OutPatterns
    // @ts-ignore
    for (const element of patterns) {
      // tslint:disable-next-line:no-conditional-assignment
      const pattern = element.pattern;
      let str;
      if (sequences.find(x => x.id === element.sequenceId)) {
        str = sequences.find(x => x.id === element.sequenceId).sequence;
        if (element.start && element.end) {
          str = str.substr(element.start - 1, element.end - (element.start - 1));
        }
        this.regexMatch(str, pattern, regions, element);
      } else {
        for (const seq of sequences) {
          // regex
          if (element.start && element.end) {
            str = seq.sequence.substr(element.start - 1, element.end - (element.start - 1));
          }
          this.regexMatch(str, pattern, regions, element);
        }
      }
    }
    return regions;

  }

  regexMatch(str, pattern, regions, element) {
    const re = new RegExp(pattern, "g");
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while ((match = re.exec(str)) != null) {
      regions.push({start: +match.index + 1, end: +match.index + +match[0].length,
        backgroundColor: element.backgroundColor, color: element.color, backgroundImage: element.backgroundImage,
        borderColor: element.borderColor, borderStyle: element.borderStyle, sequenceId: element.sequenceId});
    }
  }

}
