import { spawn } from 'child_process';

// Record Audio Function
const recordAudio = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // arecord command
    const process = spawn('arecord', [
      '-D', 'plughw:1,0', 
      '-c1', 
      '-r', '44100', 
      '-f', 'S32_LE', 
      '-t', 'wav', 
      '-V', 'mono', 
      '-v', 
      'file.wav'  // output file
    ]);

    // Handle stdout data
    process.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    // Handle stderr data
    process.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    // Handle close event
    process.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve();
    });

    // Stop recording after 5 seconds
    setTimeout(() => {
      process.kill();
    }, 5000); // 5000 milliseconds = 5 seconds
  });
};

// Main Function
const main = async () => {
  try {
    await recordAudio();
    console.log('Audio recording finished.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();

