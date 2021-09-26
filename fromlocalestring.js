function FromLocaleString(/* localeData */) {
  "use strict";

  var that = this;
  this.localeData = arguments;

  // get thousands- and decimal-separators
  function getSeparators() {

    // known number.
    // the thousands-separator will be between 1 and 2.
    // the decimal-separator will be between 4 and 5.
    var number = 1234.5679123456789;

    // localize
    var txt = number.toLocaleString.apply(number, that.localeData);

    // 兼容希伯来语、阿拉伯语
    txt = FromLocaleString.prototype._parseVariant(txt);

    // find sentinels
    var localThousandsSepIndex1 = txt.indexOf('1');
    var localThousandsSepIndex2 = txt.indexOf('2');
    var localDecimalSepIndex1 = txt.indexOf('4');
    var localDecimalSepIndex2 = txt.indexOf('5');

    // get the separators from the localized string
    var thousandsSeparator = txt.substring(localThousandsSepIndex1 + 1, localThousandsSepIndex2);
    var decimalSeparator = txt.substring(localDecimalSepIndex1 + 1, localDecimalSepIndex2);

    // number of decimal places
    var decimalPlaces = txt.length - localDecimalSepIndex2 - 1;

    return {
      thousandsSeparator: thousandsSeparator,
      decimalSeparator: decimalSeparator,
      parseFloatDecimalSeparator: '.',
      parseFloatThousandsSeparator: '',
      decimalPlaces: decimalPlaces
    };
  }
  this.separators = getSeparators();
};

// 兼容希伯来语、阿拉伯语
FromLocaleString.prototype._parseVariant = function(txt){
  if (!txt) {
    return txt;
  }
  return `${txt}`.replace(/[१२३४५६७८९०]/g, function (d) {
    return d.charCodeAt(0) - 2406;
  }).replace(/[١٢٣٤٥٦٧٨٩٠]/g, function (d) {
    return d.charCodeAt(0) - 1632;
  });
}

FromLocaleString.prototype._cleanNumber = function(txt) {
  "use strict";

  // if (isNaN(txt)) {
  //   return txt;
  // }

  var clean = `${txt}`;

  // 兼容希伯来语、阿拉伯语
  clean = this._parseVariant(clean);

  //   The native Number() method not remove thousands-separators
  //
  //   // remove thousands-separators
  //   if (this.separators.thousandsSeparator && this.separators.thousandsSeparator != this.separators.parseFloatThousandsSeparator) {
  //     while (clean.indexOf(this.separators.thousandsSeparator) != -1) {
  //       clean = clean.replace(
  //         this.separators.thousandsSeparator,
  //         this.separators.parseFloatThousandsSeparator
  //       );
  //     }
  //   }

  // convert decimal-separator to one that
  // parseFloat understands
  if (this.separators.decimalSeparator !== this.separators.parseFloatDecimalSeparator) {
    clean = clean.replace(
      this.separators.decimalSeparator,
      this.separators.parseFloatDecimalSeparator
    );
  }

  // 兼容单一符号传入的情况
  // 例如：本地小数点是 "." 的情况下，传入 txt=","，输出会是 clean=""。预期为 Number(",") == NaN，但实际值却是 Number("") == 0，与原生 Number 有出入。
  // 实际会有更多不同情况要考虑，完整做法应该是只替换处在千分位正确位置上的千分位字符，目前先只处理单个符号的场景
  if (clean === '') {
    return txt;
  }

  return clean;
};

FromLocaleString.prototype.Number = function(txt) {
  "use strict";

  var clean = this._cleanNumber(txt);
  return Number(clean);
};

FromLocaleString.prototype.parseFloat = function(txt) {
  "use strict";

  var clean = this._cleanNumber(txt);
  return parseFloat(clean);
};

FromLocaleString.prototype.parseInt = function(txt, base) {
  "use strict";

  var clean = this._cleanNumber(txt);

  if (base) {
    return parseInt(clean, base);
  } else {
    return parseInt(clean);
  }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = FromLocaleString;
}
