const os = require('os')
const fs = require('fs').promises
const parse = require('csv-parse/lib/sync');
/*var gis = require('g-i-s');
gis('KAL -  SOFT CALCIUM HIGH POTENCY', logResults);

function logResults(error, results) {
  if (error) {
    console.log(error);
  }
  else {
    console.log(JSON.stringify(results, null, '  '));
  }
}*/


(async function () {
  // Prepare the dataset
  await fs.writeFile(`${os.tmpdir()}/input.csv`, [
    '\ufeff', // BOM
    'a,1\n',  // First record
    'b,2\n'  // Second record
  ].join(''), {encoding: 'utf8'})
  // Read the content
  const content = await fs.readFile(`csv/Zhou Database FINAL.csv`)
  // Parse the CSV content
  const records = parse(content, {
    bom: true
  })
  // Print records to the console
  let recordIndex = 0
  const updatedRecords = records.flatMap(record => {
    if (recordIndex === 0) {
      recordIndex++
      record.unshift("Handle")
      return [record]
    } else {
      recordIndex++

      record[1] = record[1].replace(/(\n)/gi, ' <br/> ')
      record.unshift(record[0].replace(/\s/gi, '-').replace(/(.)\1+/g, '$1'))
      record[15] = record[15].split(',')
      if (record[15][1]) {//if there's more than one image we've got to add new records
        const imageURls = record[15]

        record[15] = record[15][0]
        imageURls.shift()
        const flatMappedImages = imageURls.flatMap(url =>{
          const urlArray = [record[0],'','','','','','','','','','','','','','',url.trim()]
          return [urlArray]
        })

        flatMappedImages.unshift(record)
        return flatMappedImages
      }
      record[15] = record[15][0]//if there's only one url then just get the first one in that array

      return [record]
    }
  })

  // Write a file with one JSON per line for each record
  const json = updatedRecords.map(JSON.stringify).join('\n')
  const items = updatedRecords
  const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
  const header = Object.keys(items[0])
  let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))

  //csv.unshift(header.join(','))
  csv = csv.join('\r\n')

  fs.writeFile(`output.json`, json)
  fs.writeFile(`output.csv`, csv)
})()