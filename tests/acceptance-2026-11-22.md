# Web application acceptance review — 22 November 2026

The review covers the twelve non-game GitHub Pages sites in this collection. Layout checks used narrow and wide browser viewports. The table records exercised workflows and release status.

| Project | Browser check | Result |
| --- | --- | --- |
| Personal directory | Open mobile search, search for QR, open the project details, return to the result and use the language menu. | The search returned one matching project. Details and launch lead to different destinations. |
| MyPDF | Switch between the native Traditional and Simplified Chinese merge pages and reload. Combine a PNG and two selected pages from a fourteen-page PDF. Reopen the export and convert it to DOCX. | The exported PDF had three pages. The Word export downloaded. The language menu offers 24 languages and automatic browser selection. GitHub Pages serves the release. The Cloudflare package is built, with production publication pending. |
| Offline Translator | Open a fresh workspace, inspect model requests, translate a French sentence into Spanish via English, and inspect the smallest layout. | The library starts collapsed. Models load on demand. The input action precedes the translation and both language selectors line up when one name wraps. The revised interface is live on GitHub Pages. The Cloudflare mirror still has its previous interface. |
| Text Counter | Enter and clear English, Chinese and combining-character samples. | English word counts, Han characters, graphemes and code points report distinct expected values. The compact mobile header leaves room for the counts. |
| Chinese Converter | Convert Chinese input containing literal markup characters. | The target characters convert and the other input stays text. The mobile input, action buttons and start of the result fit closer together. |
| QR Code | Generate a code from mixed-script text, open the mobile decoder shortcut and decode a known PNG. | The shortcut focuses the decoder heading. The decoder recovered the expected text and recorded a successful image. |
| CustomizeRank | Create a rating, import an image, reload twice, then export a ranking. | Rows and images survive both reloads. The PNG downloads and a visible download link remains. |
| Microsoft Forms CSS Themes | Open all eight static and animated HTML previews and inspect each linked image. | All eight HTML pages opened. Each linked PNG measured 3840 by 2160 pixels. |
| RandomKit | Switch to Random numbers and generate a value. | The result appeared in the result panel and history. |
| CrowdLab | Pause, enter layout editing, finish editing and resume. | The controls and simulation state followed each change. |
| PlanCraft | Switch from the 2D plan to the 3D workspace. | The scene and orbit controls appeared. |
| WebPP | Unlock the editor, create a document and export a PNG. | The editor opened and the PNG downloaded. |

## Hosting

Seven existing Cloudflare projects received updates through their production upload forms. They cover RandomKit, CrowdLab, PlanCraft, Text Counter, Chinese Converter, QR Code and the shared ZackTools site. The shared site retains its directory, legacy redirects and headers.

[GitHub Pages release](https://github.com/FionViber/MyPDF/actions/runs/44938602411) · [Cloudflare MyPDF build](https://github.com/FionViber/MyPDF/actions/runs/44939653923) · [Tool mirror packages](https://github.com/FionViber/fionviber.github.io/actions/runs/44939269344)
