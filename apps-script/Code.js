const SPREADSHEET_ID = "1wwBLB11y2WGhSyBaKduIgTaSPfxo09YzE9tMY76lwb4";

const ADMIN_SHEET = "Admins";
const CONTENT_SHEET = "Content";
const SESSION_SHEET = "Sessions";

const SESSION_HOURS = 24;


// ================================
// GET REQUEST
// ================================

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

    new Date()

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

  return {

    id: row[0],

    title: row[1],

    type: row[2],

    imdbId: row[3],

    imdbRating: row[4],

    imdbVotes: row[5],

    poster: row[6],

    backdrop: row[7],

    year: row[8],

    runtime: row[9],

    genres: row[10],

    description: row[11],

    cast: row[12],

    director: row[13],

    writer: row[14],

    watchUrl: row[15],

    featured: row[16],

    trending: row[17],

    latest: row[18],

    published: row[19],

    createdAt: row[20]

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
