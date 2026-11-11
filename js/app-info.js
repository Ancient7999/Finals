/* Finals version and changelog: the one file to edit for a new update.
   For each update: add a new block at the TOP of `releases` (newest first) with the new version, the date
   (dd/mm/yyyy) and a few short, plain lines for students. Nothing else needs changing: the What's New
   pop-up, Settings → Changelog and the "new update" notice all read from here.
   Keep each block's version and date written the same way as below (the update check reads the first block). */
var APP_INFO = {
  releases: [
    {
      version: '0.1',
      date: '11/11/2026',
      changes: [
        'Initial Finals skeleton, built from the Periodic Test 2 site.',
        'Medical Physics Chapter 7, Chapter 8 and Mixed Chapters banks are available as drafts under Week 16-18.',
        'Chapter 7 formula practice is included as a draft.',
        'Other subjects are listed but do not have question banks yet.'
      ]
    }
  ]
};
// the current version (the top block), in the shape the rest of the site uses
APP_INFO.version = APP_INFO.releases[0].version;
APP_INFO.revisionDate = APP_INFO.releases[0].date;
APP_INFO.changelog = APP_INFO.releases[0].changes;
