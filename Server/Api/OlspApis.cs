﻿using OsuDataDistributeRestful.Server;
using OsuDataDistributeRestful.Server.Api;
using OsuLiveStatusPanel;
using Sync.Plugins;
using System.IO;
using System.Linq;

namespace OsuDataDistributeRestful.Api
{
    [Route("/api/olsp")]
    internal class OlspApis : IApi
    {
        private OsuLiveStatusPanelPlugin olsp;

        public OlspApis(Plugin olsp_plguin)
        {
            olsp = olsp_plguin as OsuLiveStatusPanelPlugin;
        }

        [Route("/{providable_data_name}")]
        public ActionResult GetDictValue(string providable_data_name)
        {
            if (providable_data_name == "mapstats")
            {
                return new ActionResult(new
                {
                    stars = olsp.GetData("stars"),
                    ar = olsp.GetData("ar"),
                    od = olsp.GetData("od"),
                    cs = olsp.GetData("cs"),
                    hp = olsp.GetData("hp"),
                    maxBpm = olsp.GetData("max_bpm"),
                    minBpm = olsp.GetData("min_bpm"),
                });
            }

            if (!olsp.EnumProvidableDataName().Any(p => p == providable_data_name))
            {
                return new ActionResult(null, 400, $"Invalid argument. Parameters：{string.Join(", ",olsp.EnumProvidableDataName())}");
            }

            var result = olsp.GetData(providable_data_name);
            return new ActionResult(new
            {
                status = result != null,
                value = result
            });
        }

        [Route("/image/background")]
        public ActionResult GetBackgoundImage()
        {
            var result = olsp.GetData("olsp_bg_path") as string;
            if (string.IsNullOrEmpty(result)) return new ActionResult(null);

            if (File.Exists(result))
            {
                var fs = File.Open(result, FileMode.Open, FileAccess.Read, FileShare.Read);
                string ext = Path.GetExtension(result);

                return new ActionResult(fs)
                {
                    ContentType = GetContentType(ext)
                };
            }
            return new ActionResult(null, 404, "No background image found");
        }

        [Route("/image/output")]
        public ActionResult GetOuputBackgoundImage()
        {
            var result = olsp.GetData("olsp_bg_save_path") as string;
            if (string.IsNullOrEmpty(result)) return new ActionResult(null);

            if (File.Exists(result))
            {
                var fs = File.Open(result, FileMode.Open, FileAccess.Read, FileShare.Read);
                string ext = Path.GetExtension(result);

                return new ActionResult(fs)
                {
                    ContentType = GetContentType(ext)
                };
            }
            return new ActionResult(null, 404, "No output image found");
        }

        [Route("/image/mods")]
        public ActionResult GetModsImage()
        {
            var result = olsp.GetData("olsp_mod_save_path") as string;
            if (string.IsNullOrEmpty(result)) return new ActionResult(null);

            if (File.Exists(result))
            {
                var fs = File.Open(result, FileMode.Open, FileAccess.Read, FileShare.Read);
                string ext = Path.GetExtension(result);

                return new ActionResult(fs)
                {
                    ContentType = GetContentType(ext)
                };
            }
            return new ActionResult(null, 404, "No mods image found.");
        }

        private string GetContentType(string fileExtention)
        {
            switch (fileExtention)
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";

                case ".png":
                    return "image/png";

                default:
                    return "application/octet-stream";
            }
        }
    }
}