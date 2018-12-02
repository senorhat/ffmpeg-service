const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const config = require(__dirname + '/constants.js');

let outputExtension;
const inputPath = 'uploads/upload';
let outputPath;

/**
 * encode an audio file to specified format. callback upon finished encoding
 * @param {file} file audio file as bytes
 * @param {string} format format for encoding
 * @param {function} callback called upon completion
 */
exports.encode = function(file, format, callback) {

  let outputPath = gatherOutputPath(format)

  writeInputFile(file, function() {
    ffmpegCall(format, outputPath, function(val) {
      callback(val);
    });
  });
};



function gatherOutputPath(format) {
  outputExtension = '';
  outputPath = 'output';
  if (format == config.MP3_CODEC) {
    outputExtension = '.mp3';
  }
  if (format == config.M4A_CODEC) {
    outputExtension = '.m4a';
  }
  return outputPath + outputExtension;
}


/** Writes unencoded file to disk
 * @param {string} file - Unencoded audio file
 * @param {function} callback - Function called upon completed writing
 */
function writeInputFile(file, callback) {
  // console.log('PATH ' + __dirname);
  // try {
  //   fs.writeFileSync(inputPath, file, '');
  //   callback();
  // } catch (e) {
  //   callback(e);
  // }
  try {
    fs.writeFile(inputPath, file, '', (res) => {
      callback(res);
    });
  } catch (e) {
    callback(e);
  }
}
/** Constructs and executes ffmpeg conversion cmd. Returns encoded filename
 * @param {string} format - Target audio format
 * @param {string} outputPath - Path for output file on local disk
 * @param {string} callback - Function called upon completed conversion
 */
function ffmpegCall(format, outputPath, callback) {
  ffmpegConvertCommand = ffmpeg(inputPath)
    .audioCodec(format)
    .on('error', function(err) {
      // console.log('FFMPEG ERROR ' + err);
      fs.unlink(inputPath, (err, res) => {
        callback(config.FFMPEG_ERROR + err);
      });
    })
    .on('end', function() {
      fs.unlink(inputPath, (err, res) => {
        callback(outputPath);
      });
    })
    .save(outputPath);
}
