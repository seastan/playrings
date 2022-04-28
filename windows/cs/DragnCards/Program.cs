using System.Diagnostics;
using System.IO.Compression;
using System.Net;

string cardsPath = "./lib/dragncards-0.1.0/priv/static/images/cards/English";
string downloadPath = Path.GetTempPath() + "/cardimages.zip";
string extractPath = Path.GetTempPath() + "/DragnCards-CardImages-main";

if (!Directory.Exists(cardsPath))
{
    await Download(downloadPath);
    Console.WriteLine("Extracting...");
    ZipFile.ExtractToDirectory(downloadPath, Path.GetTempPath());
    Directory.Move(extractPath, cardsPath);
}

if (File.Exists(downloadPath))
{
    File.Delete(downloadPath);
}

Console.WriteLine("Starting instance");
ProcessStartInfo startInfo = new ProcessStartInfo();
startInfo.WorkingDirectory = Directory.GetCurrentDirectory() + "/lib/dragncards-0.1.0";
startInfo.FileName = Directory.GetCurrentDirectory() + "/bin/server.bat";
startInfo.UseShellExecute = false;
Process p = Process.Start(startInfo);
Process.Start("explorer.exe", "http://localhost:4000");
p.WaitForExit();

async Task Download(string path)
{
    Console.WriteLine("Downloading card images...");
    const double APPROX_TOTAL_BYTES = 720 * 1000000;
    using (WebClient webClient = new WebClient())
    {
        webClient.DownloadProgressChanged += new DownloadProgressChangedEventHandler(delegate (object sender, DownloadProgressChangedEventArgs e)
        {
            double progress = (double)e.BytesReceived / APPROX_TOTAL_BYTES * 100f;
            Console.Write("\r{0:N2}%", progress);
        });

        webClient.DownloadFileCompleted += new System.ComponentModel.AsyncCompletedEventHandler(delegate (object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        {
            if (e.Error == null && !e.Cancelled)
            {
                Console.Write("\rDownload complete");
                Console.WriteLine();
            }
        });
        await webClient.DownloadFileTaskAsync(new Uri("https://github.com/seastan/DragnCards-CardImages/archive/refs/heads/main.zip"), path);
    }
}