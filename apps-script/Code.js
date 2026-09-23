const SPREADSHEET_ID = "1wwBLB11y2WGhSyBaKduIgTaSPfxo09YzE9tMY76lwb4";

const ADMIN_SHEET = "Admins";
const CONTENT_SHEET = "Content";
const SESSION_SHEET = "Sessions";

const SESSION_HOURS = 24;


// ================================
// GET REQUEST
// ================================


function getImdbMetadata(imdbId) {
  const match = String(imdbId || "").trim().match(/^tt\d{7,9}$/i);

  if (!match) {
    return {
      success: false,
      error: "Invalid IMDb ID format."
    };
  }

  const cleanId = match[0].toLowerCase();

  const apiKey = PropertiesService
    .getScriptProperties()
    .getProperty("OMDB_API_KEY");

  if (!apiKey) {
    return {
      success: false,
      error: "OMDB_API_KEY is not configured on the server."
    };
  }

  try {
    const response = UrlFetchApp.fetch(
      "https://www.omdbapi.com/?i=" +
      encodeURIComponent(cleanId) +
      "&apikey=" +
      encodeURIComponent(apiKey),
      {
        method: "get",
        muteHttpExceptions: true
      }
    );

    const data = JSON.parse(response.getContentText());

    if (data.Response !== "True") {
      return {
        success: false,
        error: data.Error || "IMDb metadata not found."
      };
    }

    return {
      success: true,
      data: {
        imdbId: cleanId,
        imdbRating: data.imdbRating !== "N/A"
          ? Number(data.imdbRating)
          : undefined,
        imdbVotes: data.imdbVotes !== "N/A"
          ? data.imdbVotes
          : undefined,
        title: data.Title !== "N/A"
          ? data.Title
          : undefined,
        originalTitle: data.Title !== "N/A"
          ? data.Title
          : undefined,
        year: data.Year !== "N/A"
          ? Number(String(data.Year).slice(0, 4))
          : undefined,
        releaseDate: data.Released !== "N/A"
          ? data.Released
          : undefined,
        runtime: data.Runtime !== "N/A"
          ? data.Runtime
          : undefined,
        genres: data.Genre !== "N/A"
          ? data.Genre.split(",").map(function(g) {
              return g.trim();
            })
          : undefined,
        poster: data.Poster !== "N/A"
          ? data.Poster
          : undefined,
        backdrop: data.Poster !== "N/A"
          ? data.Poster
          : undefined,
        description: data.Plot !== "N/A"
          ? data.Plot
          : undefined,
        director: data.Director !== "N/A"
          ? data.Director
          : undefined,
        writer: data.Writer !== "N/A"
          ? data.Writer
          : undefined,
        cast: data.Actors !== "N/A"
          ? data.Actors.split(",").map(function(a) {
              return a.trim();
            })
          : undefined,
        country: data.Country !== "N/A"
          ? data.Country
          : undefined,
        language: data.Language !== "N/A"
          ? data.Language.split(",")[0].trim()
          : undefined
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function doGet(e) {

  try {

    const action =
      e && e.parameter
        ? e.parameter.action
        : "health";

    if (action === "health") {

      return json({
        success: true,
        message: "bdcinemas API is running"
      });

    }


    if (action === "metadata") {
      return json(
        getImdbMetadata(e.parameter.imdbId)
      );
    }

    if (action === "published") {

      return json({
        success: true,
        data: getPublishedContent()
      });

    }

    return json({
      success: false,
      error: "Unknown action"
    });

  } catch (error) {

    return json({
      success: false,
      error: error.message
    });

  }

}


// ================================
// POST REQUEST
// ================================

function doPost(e) {

  try {

    const data =
      JSON.parse(e.postData.contents || "{}");

    const action = data.action;

    switch (action) {

      case "setup":
        setupDatabase();
        return json({
          success: true,
          message: "Database setup completed"
        });


      case "createAdmin":
        return json(
          createAdmin(
            data.email,
            data.password
          )
        );


      case "login":
        return json(
          login(
            data.email,
            data.password
          )
        );



      case "checkSession":
        return json(
          checkSession(
            data.sessionId
          )
        );


      case "logout":
        return json(
          logout(
            data.sessionId
          )
        );


      case "getPublished":
        return json({
          success: true,
          data: getPublishedContent()
        });


      case "getContent":
        return json(
          getAllContent(
            data.sessionId
          )
        );


      case "createContent":
        return json(
          createContent(
            data.sessionId,
            data.content
          )
        );


      case "publishContent":
        return json(
          publishContent(
            data.sessionId,
            data.contentId,
            data.published
          )
        );


      case "updateContent":
        return json(
          updateContent(
            data.sessionId,
            data.contentId,
            data.content
          )
        );

      case "deleteContent":
        return json(
          deleteContent(
            data.sessionId,
            data.contentId
          )
        );


      default:

        return json({
          success: false,
          error: "Unknown action"
        });

    }

  } catch (error) {

    return json({
      success: false,
      error: error.message
    });

  }

}


// ================================
// DATABASE
// ================================

function getSpreadsheet() {

  return SpreadsheetApp.openById(
    SPREADSHEET_ID
  );

}


function getSheet(name) {

  const spreadsheet =
    getSpreadsheet();

  return spreadsheet.getSheetByName(name);

}


function setupDatabase() {

  const spreadsheet =
    getSpreadsheet();


  // Admins

  let admins =
    spreadsheet.getSheetByName(
      ADMIN_SHEET
    );

  if (!admins) {

    admins =
      spreadsheet.insertSheet(
        ADMIN_SHEET
      );

  }

  if (admins.getLastRow() === 0) {

    admins.appendRow([
      "id",
      "email",
      "passwordHash",
      "role",
      "active",
      "createdAt"
    ]);

  }


  // Content

  let content =
    spreadsheet.getSheetByName(
      CONTENT_SHEET
    );

  if (!content) {

    content =
      spreadsheet.insertSheet(
        CONTENT_SHEET
      );

  }

  if (content.getLastRow() === 0) {

    content.appendRow([

      "id",
      "title",
      "type",
      "imdbId",
      "imdbRating",
      "imdbVotes",
      "poster",
      "backdrop",
      "year",
      "runtime",
      "genres",
      "description",
      "cast",
      "director",
      "writer",
      "watchUrl",
      "featured",
      "trending",
      "latest",
      "published",
      "createdAt"

    ]);

  }


  // Sessions

  let sessions =
    spreadsheet.getSheetByName(
      SESSION_SHEET
    );

  if (!sessions) {

    sessions =
      spreadsheet.insertSheet(
        SESSION_SHEET
      );

  }

  if (sessions.getLastRow() === 0) {

    sessions.appendRow([

      "sessionId",
      "adminId",
      "createdAt",
      "expiresAt",
      "active"

    ]);

  }

}


// ================================
// CREATE ADMIN
// ================================

function createAdmin(
  email,
  password
) {

  if (!email || !password) {

    return {
      success: false,
      error: "Email and password are required"
    };

  }


  const sheet =
    getSheet(ADMIN_SHEET);


  if (!sheet) {

    return {
      success: false,
      error: "Admins sheet not found. Run setup first."
    };

  }


  const values =
    sheet.getDataRange()
      .getValues();


  const normalizedEmail =
    String(email)
      .trim()
      .toLowerCase();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const existingEmail =
      String(values[i][1])
        .trim()
        .toLowerCase();

    if (
      existingEmail ===
      normalizedEmail
    ) {

      return {
        success: false,
        error: "Admin already exists"
      };

    }

  }


  const adminId =
    generateId();


  sheet.appendRow([

    adminId,

    normalizedEmail,

    hashPassword(password),

    "admin",

    true,

    new Date()

  ]);


  return {

    success: true,

    message: "Admin created",

    adminId: adminId

  };

}


// ================================
// LOGIN
// ================================

function login(
  email,
  password
) {

  if (!email || !password) {

    return {
      success: false,
      error: "Email and password are required"
    };

  }


  const sheet =
    getSheet(ADMIN_SHEET);


  if (!sheet) {

    return {
      success: false,
      error: "Admins sheet not found"
    };

  }


  const values =
    sheet.getDataRange()
      .getValues();


  const normalizedEmail =
    String(email)
      .trim()
      .toLowerCase();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const rowEmail =
      String(row[1])
        .trim()
        .toLowerCase();


    const passwordHash =
      String(row[2]);


    const active =
      String(row[4])
        .toLowerCase() === "true";


    if (
      rowEmail === normalizedEmail &&
      passwordHash ===
        hashPassword(password) &&
      active
    ) {

      const sessionId =
        generateId();


      const createdAt =
        new Date();


      const expiresAt =
        new Date(
          createdAt.getTime() +
          SESSION_HOURS *
          60 *
          60 *
          1000
        );


      const sessionSheet =
        getSheet(SESSION_SHEET);


      sessionSheet.appendRow([

        sessionId,

        row[0],

        createdAt,

        expiresAt,

        true

      ]);


      return {

        success: true,

        sessionId: sessionId,

        admin: {

          id: row[0],

          email: row[1],

          role: row[3]

        }

      };

    }

  }


  return {

    success: false,

    error: "Invalid email or password"

  };

}


// ================================
// CHECK SESSION
// ================================

function checkSession(
  sessionId
) {

  if (!sessionId) {

    return {
      success: false,
      error: "Session ID required"
    };

  }


  const sheet =
    getSheet(SESSION_SHEET);


  const values =
    sheet.getDataRange()
      .getValues();


  const now =
    new Date();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    if (
      String(row[0]) ===
      String(sessionId)
    ) {

      const expiresAt =
        new Date(row[3]);


      const active =
        String(row[4])
          .toLowerCase() === "true";


      if (
        active &&
        expiresAt > now
      ) {

        return {

          success: true,

          adminId: row[1]

        };

      }

    }

  }


  return {

    success: false,

    error: "Session expired or invalid"

  };

}


// ================================
// LOGOUT
// ================================

function logout(
  sessionId
) {

  const sheet =
    getSheet(SESSION_SHEET);


  const values =
    sheet.getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(sessionId)
    ) {

      sheet
        .getRange(i + 1, 5)
        .setValue(false);


      return {

        success: true,

        message: "Logged out"

      };

    }

  }


  return {

    success: false,

    error: "Session not found"

  };

}


// ================================
// CREATE CONTENT
// ================================

function createContent(
  sessionId,
  content
) {

  const auth =
    checkSession(sessionId);


  if (!auth.success) {

    return auth;

  }


  if (!content) {

    return {

      success: false,

      error: "Content data is required"

    };

  }


  const sheet =
    getSheet(CONTENT_SHEET);


  const contentId =
    generateId();


  sheet.appendRow([

    contentId,

    content.title || "",

    content.type || "",

    content.imdbId || "",

    content.imdbRating || "",

    content.imdbVotes || "",

    content.poster || "",

    content.backdrop || "",

    content.year || "",

    content.runtime || "",

    content.genres || "",

    content.description || "",

    content.cast || "",

    content.director || "",

    content.writer || "",

    content.watchUrl || "",

    content.featured || false,

    content.trending || false,

    content.latest || true,

    content.published || false,

    new Date(),
      JSON.stringify(
        Array.isArray(content.seasons)
          ? content.seasons
          : []
      )

  ]);


  return {

    success: true,

    message: "Content created",

    contentId: contentId

  };

}


// ================================
// GET ALL CONTENT
// ================================

function getAllContent(
  sessionId
) {

  const auth =
    checkSession(sessionId);


  if (!auth.success) {

    return auth;

  }


  const sheet =
    getSheet(CONTENT_SHEET);


  const values =
    sheet.getDataRange()
      .getValues();


  const data = [];


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    data.push(
      rowToContent(values[i])
    );

  }


  return {

    success: true,

    data: data

  };

}


// ================================
// GET PUBLISHED CONTENT
// ================================

function getPublishedContent() {

  const sheet =
    getSheet(CONTENT_SHEET);


  if (!sheet) {

    return [];

  }


  const values =
    sheet.getDataRange()
      .getValues();


  const data = [];


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const row =
      values[i];


    const published =
      String(row[19])
        .toLowerCase() === "true";


    if (published) {

      data.push(
        rowToContent(row)
      );

    }

  }


  return data;

}


// ================================
// PUBLISH / UNPUBLISH
// ================================

function publishContent(
  sessionId,
  contentId,
  published
) {

  const auth =
    checkSession(sessionId);


  if (!auth.success) {

    return auth;

  }


  const sheet =
    getSheet(CONTENT_SHEET);


  const values =
    sheet.getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(contentId)
    ) {

      sheet
        .getRange(i + 1, 20)
        .setValue(
          Boolean(published)
        );


      return {

        success: true,

        message:
          published
            ? "Content published"
            : "Content unpublished"

      };

    }

  }


  return {

    success: false,

    error: "Content not found"

  };

}


// ================================
// DELETE CONTENT
// ================================

function updateContent(
  sessionId,
  contentId,
  content
) {
  const auth = checkSession(sessionId);

  if (!auth.success) {
    return auth;
  }

  if (!content) {
    return {
      success: false,
      error: "Content data is required"
    };
  }

  const sheet = getSheet(CONTENT_SHEET);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (
      String(values[i][0]) ===
      String(contentId)
    ) {
      const currentPublished =
        values[i][19] === true ||
        String(values[i][19] || "").toLowerCase() === "true";

      sheet
        .getRange(i + 1, 2, 1, 19)
        .setValues([[
          content.title || "",
          content.type || "movie",
          content.imdbId || "",
          content.imdbRating || "",
          content.imdbVotes || "",
          content.poster || "",
          content.backdrop || "",
          content.year || "",
          content.runtime || "",
          content.genres || "",
          content.description || "",
          content.cast || "",
          content.director || "",
          content.writer || "",
          content.watchUrl || "",
          content.featured || false,
          content.trending || false,
          content.latest !== undefined ? content.latest : true,
          content.published !== undefined
            ? Boolean(content.published)
            : currentPublished
        ]]);

      const seasonsValue =
          Array.isArray(content.seasons)
            ? JSON.stringify(content.seasons)
            : "[]";

        sheet
          .getRange(i + 1, 22)
          .setValue(seasonsValue);

        SpreadsheetApp.flush();

      return {
        success: true,
        message: "Content updated successfully",
        contentId: String(contentId)
      };
    }
  }

  return {
    success: false,
    error: "Content not found"
  };
}

function deleteContent(
  sessionId,
  contentId
) {

  const auth =
    checkSession(sessionId);


  if (!auth.success) {

    return auth;

  }


  const sheet =
    getSheet(CONTENT_SHEET);


  const values =
    sheet.getDataRange()
      .getValues();


  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    if (
      String(values[i][0]) ===
      String(contentId)
    ) {

      sheet.deleteRow(i + 1);


      return {

        success: true,

        message: "Content deleted"

      };

    }

  }


  return {

    success: false,

    error: "Content not found"

  };

}


// ================================
// CONVERT ROW TO OBJECT
// ================================

function rowToContent(row) {
  const title = String(row[1] || "").trim();
  const typeValue = String(row[2] || "movie").trim().toLowerCase();
  const type = typeValue === "series" || typeValue === "tv-show" || typeValue === "movie" ? typeValue : "movie";

  const genres = String(row[10] || "").split(",").map(function(item) { return item.trim(); }).filter(function(item) { return item.length > 0; });
  const cast = String(row[12] || "").split(",").map(function(item) { return item.trim(); }).filter(function(item) { return item.length > 0; });

  const yearNumber = Number(row[8]);
  const imdbRatingNumber = Number(row[4]);
  const imdbRating = Number.isFinite(imdbRatingNumber) ? imdbRatingNumber : 0;

  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const published = row[19] === true || String(row[19] || "").toLowerCase() === "true";
  const featured = row[16] === true || String(row[16] || "").toLowerCase() === "true";
  const trending = row[17] === true || String(row[17] || "").toLowerCase() === "true";
  const latest = row[18] === true || String(row[18] || "").toLowerCase() === "true";
    let seasons = [];

    try {
      const seasonsValue = String(row[21] || "").trim();

      if (seasonsValue) {
        const parsedSeasons = JSON.parse(seasonsValue);

        if (Array.isArray(parsedSeasons)) {
          seasons = parsedSeasons;
        }
      }
    } catch (error) {
      seasons = [];
    }


  const createdAt = row[20] ? new Date(row[20]).toISOString() : new Date().toISOString();

  return {
    id: String(row[0] || ""),
    title: title,
    slug: slug,
    originalTitle: title,
    description: String(row[11] || ""),
    poster: String(row[6] || ""),
    backdrop: String(row[7] || ""),
    year: Number.isFinite(yearNumber) ? yearNumber : 0,
    releaseDate: createdAt,
    runtime: String(row[9] || ""),
    rating: imdbRating,
    imdbId: String(row[3] || ""),
    imdbRating: imdbRating,
    imdbVotes: String(row[5] || ""),
    genres: genres,
    language: "Bangla",
    country: "Bangladesh",
    quality: "1080p FHD",
    type: type,
    cast: cast,
    director: String(row[13] || ""),
    writer: String(row[14] || ""),
    views: 0,
    featured: featured,
    trending: trending,
    comingSoon: false,
    seasons: seasons,
    videoUrl: String(row[15] || ""),
    trailerUrl: "",
    published: published,
    createdAt: createdAt,
    latest: latest
  };
}


// ================================
// PASSWORD HASH
// ================================

function hashPassword(password) {

  const raw =
    Utilities.computeDigest(

      Utilities.DigestAlgorithm.SHA_256,

      String(password),

      Utilities.Charset.UTF_8

    );


  return raw
    .map(function(byte) {

      const value =
        byte < 0
          ? byte + 256
          : byte;

      return (
        "0" +
        value.toString(16)
      ).slice(-2);

    })
    .join("");

}


// ================================
// GENERATE ID
// ================================

function generateId() {

  return (

    Utilities.getUuid()
      .replace(/-/g, "")

  );

}


// ================================
// JSON RESPONSE
// ================================

function json(data) {

  return ContentService

    .createTextOutput(
      JSON.stringify(data)
    )

    .setMimeType(
      ContentService.MimeType.JSON
    );

}
function testDatabaseConnection() {
  const spreadsheet = getSpreadsheet();

  const sheet =
    spreadsheet.getSheetByName("Sheet1") ||
    spreadsheet.insertSheet("Sheet1");

  sheet.getRange("A1:B10").clearContent();

  sheet.getRange("A1:B1").setValues([
    ["Diagnostic", "Value"]
  ]);

  sheet.getRange("A2:B2").setValues([
    ["Spreadsheet ID", spreadsheet.getId()]
  ]);

  sheet.getRange("A3:B3").setValues([
    ["Spreadsheet Name", spreadsheet.getName()]
  ]);

  sheet.getRange("A4:B4").setValues([
    ["Spreadsheet URL", spreadsheet.getUrl()]
  ]);

  const sheets = spreadsheet.getSheets();

  sheets.forEach(function(item, index) {
    sheet.getRange(index + 6, 1, 1, 2).setValues([
      ["Sheet " + (index + 1), item.getName()]
    ]);
  });

  SpreadsheetApp.flush();
}

