const SHEETS = {
  USERS: "Users",
  APPOINTMENTS: "Appointments",
  ANNOUNCEMENTS: "Announcements",
  PRODUCTS: "Products",
  AUDIT: "AuditLog"
};

const HEADERS = {
  Users: [
    "userId",
    "role",
    "email",
    "name",
    "nicknamePublic",
    "nicknamePrivate",
    "phoneE164",
    "birthDate",
    "createdAt",
    "updatedAt",
    "active"
  ],
  Appointments: [
    "appointmentId",
    "userId",
    "startAt",
    "endAt",
    "status",
    "value",
    "notesPrivate",
    "updatedAt"
  ],
  Announcements: [
    "announcementId",
    "title",
    "content",
    "isPublished",
    "createdAt",
    "updatedAt"
  ],
  Products: [
    "productId",
    "name",
    "price",
    "description",
    "photoUrl",
    "isActive",
    "createdAt",
    "updatedAt"
  ],
  AuditLog: ["id", "at", "actorEmail", "action", "targetId", "metaJson"]
};

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  const override = (e && e.parameter && e.parameter.__method) || null;
  const method = override || "POST";
  return handleRequest(e, method);
}

function handleRequest(e, method) {
  try {
    const path = (e && e.pathInfo) || "";
    const payload = parseBody(e);
    const token = getToken(e, payload);

    const route = path.split("/").filter(Boolean);

    if (route[0] === "auth" && route[1] === "me" && method === "POST") {
      return jsonResponse(authMe(payload));
    }

    if (route[0] === "announcements" && method === "GET") {
      return jsonResponse(listAnnouncements(e));
    }

    if (route[0] === "products" && method === "GET") {
      return jsonResponse(listProducts(e));
    }

    if (route[0] === "me") {
      const auth = requireAuth(token);
      if (route[1] === "agenda" && method === "GET") {
        return jsonResponse(listAppointmentsForUser(auth.userId, true));
      }
      if (route[1] === "history" && method === "GET") {
        const days = Number((e.parameter && e.parameter.days) || 30);
        return jsonResponse(listHistoryForUser(auth.userId, days));
      }
      if (route[1] === "profile") {
        if (method === "GET") {
          return jsonResponse(getUser(auth.userId));
        }
        if (method === "PUT") {
          return jsonResponse(updateUserProfile(auth.userId, payload));
        }
      }
    }

    if (route[0] === "owner") {
      const auth = requireAuth(token);
      if (auth.role !== "OWNER") {
        return jsonError("Nao autorizado", 403);
      }

      if (route[1] === "agenda") {
        if (method === "GET") {
          const upcoming = (e.parameter && e.parameter.upcoming) === "1";
          return jsonResponse(listAppointmentsAll(upcoming));
        }
        if (method === "POST") {
          return jsonResponse(createAppointment(payload, auth));
        }
        if (route[2] && method === "PUT") {
          return jsonResponse(updateAppointment(route[2], payload, auth));
        }
        if (route[2] && method === "DELETE") {
          return jsonResponse(deleteAppointment(route[2], auth));
        }
      }

      if (route[1] === "clients") {
        if (method === "GET") {
          return jsonResponse(listUsers());
        }
        if (method === "POST") {
          return jsonResponse(createUser(payload, auth));
        }
        if (route[2] && method === "PUT") {
          return jsonResponse(updateUser(route[2], payload, auth));
        }
        if (route[2] && method === "DELETE") {
          return jsonResponse(deleteUser(route[2], auth));
        }
      }

      if (route[1] === "announcements") {
        if (method === "GET") {
          return jsonResponse(listAnnouncements({ parameter: {} }));
        }
        if (method === "POST") {
          return jsonResponse(createAnnouncement(payload, auth));
        }
        if (route[2] && method === "PUT") {
          return jsonResponse(updateAnnouncement(route[2], payload, auth));
        }
        if (route[2] && method === "DELETE") {
          return jsonResponse(deleteAnnouncement(route[2], auth));
        }
      }

      if (route[1] === "products") {
        if (method === "GET") {
          return jsonResponse(listProducts({ parameter: {} }));
        }
        if (method === "POST") {
          return jsonResponse(createProduct(payload, auth));
        }
        if (route[2] && method === "PUT") {
          return jsonResponse(updateProduct(route[2], payload, auth));
        }
        if (route[2] && method === "DELETE") {
          return jsonResponse(deleteProduct(route[2], auth));
        }
      }

      if (route[1] === "history" && method === "GET") {
        const days = Number((e.parameter && e.parameter.days) || 30);
        return jsonResponse(listHistoryAll(days));
      }

      if (route[1] === "stats" && route[2] === "week" && method === "GET") {
        return jsonResponse({ total: sumForPeriod(7) });
      }

      if (route[1] === "stats" && route[2] === "month" && method === "GET") {
        return jsonResponse({ total: sumForPeriod(30) });
      }

      if (route[1] === "push" && method === "POST") {
        return jsonResponse(sendPush(payload, auth));
      }
    }

    return jsonError("Rota nao encontrada", 404);
  } catch (err) {
    return jsonError(err && err.message ? err.message : "Erro interno", 500);
  }
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return {};
  }
}

function getToken(e, payload) {
  if (payload && payload.token) return payload.token;
  if (e && e.parameter && e.parameter.token) return e.parameter.token;
  if (e && e.headers) {
    const auth = e.headers.Authorization || e.headers.authorization;
    if (auth && auth.indexOf("Bearer ") === 0) {
      return auth.replace("Bearer ", "");
    }
  }
  return null;
}

function jsonResponse(data, status) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return withCors(output, status || 200);
}

function jsonError(message, status) {
  return jsonResponse({ error: message }, status || 400);
}

function withCors(output, status) {
  if (output.setHeader) {
    output.setHeader("Access-Control-Allow-Origin", "*");
    output.setHeader("Access-Control-Allow-Methods", "GET,POST");
    output.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    output.setHeader("Access-Control-Max-Age", "3600");
  }
  if (output.setStatusCode) {
    output.setStatusCode(status || 200);
  }
  return output;
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, HEADERS[name].length).setValues([HEADERS[name]]);
  }
  return sheet;
}

function getSpreadsheetId() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("Configure SPREADSHEET_ID em Script Properties.");
  return id;
}

function getOwnerEmail() {
  return PropertiesService.getScriptProperties().getProperty("OWNER_EMAIL") || "";
}

function authMe(payload) {
  if (!payload || !payload.idToken) throw new Error("idToken ausente");
  const tokenInfo = verifyIdToken(payload.idToken);
  const email = tokenInfo.email;
  const role = email === getOwnerEmail() ? "OWNER" : "CLIENT";
  const userId = tokenInfo.sub;
  const user = upsertUser({
    userId: userId,
    role: role,
    email: email,
    name: tokenInfo.name || tokenInfo.given_name || email,
    nicknamePublic: tokenInfo.given_name || tokenInfo.name || ""
  });
  return {
    token: payload.idToken,
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      nicknamePublic: user.nicknamePublic,
      role: user.role
    }
  };
}

function verifyIdToken(idToken) {
  const response = UrlFetchApp.fetch(
    "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken)
  );
  if (response.getResponseCode() !== 200) {
    throw new Error("Token invalido");
  }
  return JSON.parse(response.getContentText());
}

function requireAuth(token) {
  if (!token) throw new Error("Token ausente");
  const info = verifyIdToken(token);
  const email = info.email;
  const role = email === getOwnerEmail() ? "OWNER" : "CLIENT";
  return { userId: info.sub, email: email, role: role };
}

function upsertUser(data) {
  const sheet = getSheet(SHEETS.USERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.userId) {
      rows[i][1] = data.role || rows[i][1];
      rows[i][2] = data.email || rows[i][2];
      rows[i][3] = data.name || rows[i][3];
      rows[i][4] = data.nicknamePublic || rows[i][4];
      rows[i][9] = new Date().toISOString();
      sheet.getRange(i + 1, 1, 1, HEADERS.Users.length).setValues([rows[i]]);
      return rowToObject(rows[i], HEADERS.Users);
    }
  }
  const row = [
    data.userId,
    data.role,
    data.email,
    data.name,
    data.nicknamePublic || "",
    data.nicknamePrivate || "",
    data.phoneE164 || "",
    data.birthDate || "",
    new Date().toISOString(),
    new Date().toISOString(),
    true
  ];
  sheet.appendRow(row);
  return rowToObject(row, HEADERS.Users);
}

function getUser(userId) {
  const sheet = getSheet(SHEETS.USERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId) {
      return rowToObject(rows[i], HEADERS.Users);
    }
  }
  throw new Error("Usuario nao encontrado");
}

function updateUserProfile(userId, payload) {
  const sheet = getSheet(SHEETS.USERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId) {
      rows[i][4] = payload.nicknamePublic || rows[i][4];
      rows[i][7] = payload.birthDate || rows[i][7];
      rows[i][9] = new Date().toISOString();
      sheet.getRange(i + 1, 1, 1, HEADERS.Users.length).setValues([rows[i]]);
      return rowToObject(rows[i], HEADERS.Users);
    }
  }
  throw new Error("Usuario nao encontrado");
}

function listUsers() {
  const sheet = getSheet(SHEETS.USERS);
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).map((row) => rowToObject(row, HEADERS.Users));
}

function createUser(payload, auth) {
  const userId = payload.userId || Utilities.getUuid();
  const row = [
    userId,
    payload.role || "CLIENT",
    payload.email || "",
    payload.name || "",
    payload.nicknamePublic || "",
    payload.nicknamePrivate || "",
    payload.phoneE164 || "",
    payload.birthDate || "",
    new Date().toISOString(),
    new Date().toISOString(),
    payload.active !== false
  ];
  getSheet(SHEETS.USERS).appendRow(row);
  logAudit(auth.email, "CREATE_USER", userId, payload);
  return rowToObject(row, HEADERS.Users);
}

function updateUser(userId, payload, auth) {
  const sheet = getSheet(SHEETS.USERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId) {
      rows[i][1] = payload.role || rows[i][1];
      rows[i][2] = payload.email || rows[i][2];
      rows[i][3] = payload.name || rows[i][3];
      rows[i][4] = payload.nicknamePublic || rows[i][4];
      rows[i][5] = payload.nicknamePrivate || rows[i][5];
      rows[i][6] = payload.phoneE164 || rows[i][6];
      rows[i][7] = payload.birthDate || rows[i][7];
      rows[i][9] = new Date().toISOString();
      rows[i][10] = payload.active !== undefined ? payload.active : rows[i][10];
      sheet.getRange(i + 1, 1, 1, HEADERS.Users.length).setValues([rows[i]]);
      logAudit(auth.email, "UPDATE_USER", userId, payload);
      return rowToObject(rows[i], HEADERS.Users);
    }
  }
  throw new Error("Usuario nao encontrado");
}

function deleteUser(userId, auth) {
  const sheet = getSheet(SHEETS.USERS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === userId) {
      sheet.deleteRow(i + 1);
      logAudit(auth.email, "DELETE_USER", userId, {});
      return { ok: true };
    }
  }
  throw new Error("Usuario nao encontrado");
}

function listAppointmentsForUser(userId, upcomingOnly) {
  const all = listAppointmentsAll(false);
  const now = new Date();
  return all
    .filter((item) => item.userId === userId)
    .filter((item) => {
      if (!upcomingOnly) return true;
      return new Date(item.startAt) >= now;
    })
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
}

function listHistoryForUser(userId, days) {
  return listHistoryAll(days).filter((item) => item.userId === userId);
}

function listHistoryAll(days) {
  const all = listAppointmentsAll(false);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return all.filter((item) => new Date(item.startAt) >= cutoff);
}

function listAppointmentsAll(upcomingOnly) {
  const sheet = getSheet(SHEETS.APPOINTMENTS);
  const rows = sheet.getDataRange().getValues();
  const now = new Date();
  return rows
    .slice(1)
    .map((row) => rowToObject(row, HEADERS.Appointments))
    .filter((item) => (upcomingOnly ? new Date(item.startAt) >= now : true));
}

function createAppointment(payload, auth) {
  const appointmentId = payload.appointmentId || Utilities.getUuid();
  const row = [
    appointmentId,
    payload.userId || "",
    payload.startAt || "",
    payload.endAt || "",
    payload.status || "BOOKED",
    payload.value || 0,
    payload.notesPrivate || "",
    new Date().toISOString()
  ];
  getSheet(SHEETS.APPOINTMENTS).appendRow(row);
  logAudit(auth.email, "CREATE_APPOINTMENT", appointmentId, payload);
  return rowToObject(row, HEADERS.Appointments);
}

function updateAppointment(appointmentId, payload, auth) {
  const sheet = getSheet(SHEETS.APPOINTMENTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === appointmentId) {
      rows[i][1] = payload.userId || rows[i][1];
      rows[i][2] = payload.startAt || rows[i][2];
      rows[i][3] = payload.endAt || rows[i][3];
      rows[i][4] = payload.status || rows[i][4];
      rows[i][5] = payload.value !== undefined ? payload.value : rows[i][5];
      rows[i][6] = payload.notesPrivate || rows[i][6];
      rows[i][7] = new Date().toISOString();
      sheet.getRange(i + 1, 1, 1, HEADERS.Appointments.length).setValues([rows[i]]);
      logAudit(auth.email, "UPDATE_APPOINTMENT", appointmentId, payload);
      return rowToObject(rows[i], HEADERS.Appointments);
    }
  }
  throw new Error("Agendamento nao encontrado");
}

function deleteAppointment(appointmentId, auth) {
  const sheet = getSheet(SHEETS.APPOINTMENTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === appointmentId) {
      sheet.deleteRow(i + 1);
      logAudit(auth.email, "DELETE_APPOINTMENT", appointmentId, {});
      return { ok: true };
    }
  }
  throw new Error("Agendamento nao encontrado");
}

function listAnnouncements(e) {
  const published = e.parameter && e.parameter.published === "1";
  const sheet = getSheet(SHEETS.ANNOUNCEMENTS);
  const rows = sheet.getDataRange().getValues();
  return rows
    .slice(1)
    .map((row) => rowToObject(row, HEADERS.Announcements))
    .filter((item) => (published ? item.isPublished === true || item.isPublished === "true" : true));
}

function createAnnouncement(payload, auth) {
  const id = payload.announcementId || Utilities.getUuid();
  const row = [
    id,
    payload.title || "",
    payload.content || "",
    payload.isPublished === true,
    new Date().toISOString(),
    new Date().toISOString()
  ];
  getSheet(SHEETS.ANNOUNCEMENTS).appendRow(row);
  logAudit(auth.email, "CREATE_ANNOUNCEMENT", id, payload);
  return rowToObject(row, HEADERS.Announcements);
}

function updateAnnouncement(id, payload, auth) {
  const sheet = getSheet(SHEETS.ANNOUNCEMENTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      rows[i][1] = payload.title || rows[i][1];
      rows[i][2] = payload.content || rows[i][2];
      rows[i][3] = payload.isPublished !== undefined ? payload.isPublished : rows[i][3];
      rows[i][5] = new Date().toISOString();
      sheet.getRange(i + 1, 1, 1, HEADERS.Announcements.length).setValues([rows[i]]);
      logAudit(auth.email, "UPDATE_ANNOUNCEMENT", id, payload);
      return rowToObject(rows[i], HEADERS.Announcements);
    }
  }
  throw new Error("Anuncio nao encontrado");
}

function deleteAnnouncement(id, auth) {
  const sheet = getSheet(SHEETS.ANNOUNCEMENTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      logAudit(auth.email, "DELETE_ANNOUNCEMENT", id, {});
      return { ok: true };
    }
  }
  throw new Error("Anuncio nao encontrado");
}

function listProducts(e) {
  const active = e.parameter && e.parameter.active === "1";
  const sheet = getSheet(SHEETS.PRODUCTS);
  const rows = sheet.getDataRange().getValues();
  return rows
    .slice(1)
    .map((row) => rowToObject(row, HEADERS.Products))
    .filter((item) => (active ? item.isActive === true || item.isActive === "true" : true));
}

function createProduct(payload, auth) {
  const id = payload.productId || Utilities.getUuid();
  const row = [
    id,
    payload.name || "",
    payload.price || 0,
    payload.description || "",
    payload.photoUrl || "",
    payload.isActive !== false,
    new Date().toISOString(),
    new Date().toISOString()
  ];
  getSheet(SHEETS.PRODUCTS).appendRow(row);
  logAudit(auth.email, "CREATE_PRODUCT", id, payload);
  return rowToObject(row, HEADERS.Products);
}

function updateProduct(id, payload, auth) {
  const sheet = getSheet(SHEETS.PRODUCTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      rows[i][1] = payload.name || rows[i][1];
      rows[i][2] = payload.price !== undefined ? payload.price : rows[i][2];
      rows[i][3] = payload.description || rows[i][3];
      rows[i][4] = payload.photoUrl || rows[i][4];
      rows[i][5] = payload.isActive !== undefined ? payload.isActive : rows[i][5];
      rows[i][7] = new Date().toISOString();
      sheet.getRange(i + 1, 1, 1, HEADERS.Products.length).setValues([rows[i]]);
      logAudit(auth.email, "UPDATE_PRODUCT", id, payload);
      return rowToObject(rows[i], HEADERS.Products);
    }
  }
  throw new Error("Produto nao encontrado");
}

function deleteProduct(id, auth) {
  const sheet = getSheet(SHEETS.PRODUCTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id) {
      sheet.deleteRow(i + 1);
      logAudit(auth.email, "DELETE_PRODUCT", id, {});
      return { ok: true };
    }
  }
  throw new Error("Produto nao encontrado");
}

function sumForPeriod(days) {
  const all = listAppointmentsAll(false);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return all
    .filter((item) => new Date(item.startAt) >= cutoff)
    .filter((item) => item.status === "DONE")
    .reduce((sum, item) => sum + Number(item.value || 0), 0);
}

function sendPush(payload, auth) {
  const appId = PropertiesService.getScriptProperties().getProperty("ONESIGNAL_APP_ID");
  const apiKey = PropertiesService.getScriptProperties().getProperty("ONESIGNAL_API_KEY");
  if (!appId || !apiKey) throw new Error("Configure ONESIGNAL_APP_ID e ONESIGNAL_API_KEY.");

  const body = {
    app_id: appId,
    headings: { en: payload.title || "Mensagem" },
    contents: { en: payload.message || "" }
  };

  if (payload.target === "all") {
    body.included_segments = ["All"];
  } else if (payload.userId || payload.email) {
    body.include_external_user_ids = [payload.userId || payload.email];
  } else {
    throw new Error("Informe target, userId ou email");
  }

  const response = UrlFetchApp.fetch("https://onesignal.com/api/v1/notifications", {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Basic " + apiKey
    },
    payload: JSON.stringify(body)
  });

  logAudit(auth.email, "SEND_PUSH", payload.target || payload.userId || payload.email, payload);

  return {
    status: response.getResponseCode(),
    response: JSON.parse(response.getContentText())
  };
}

function logAudit(actorEmail, action, targetId, meta) {
  const row = [
    Utilities.getUuid(),
    new Date().toISOString(),
    actorEmail,
    action,
    targetId,
    JSON.stringify(meta || {})
  ];
  getSheet(SHEETS.AUDIT).appendRow(row);
}

function rowToObject(row, headers) {
  const obj = {};
  headers.forEach((header, idx) => {
    obj[header] = row[idx];
  });
  return obj;
}
