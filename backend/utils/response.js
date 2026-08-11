/** Format de reponse uniforme de l'API. */
exports.ok = (res, data, message = 'Succes', meta = undefined) =>
  res.status(200).json({ success: true, message, data, ...(meta ? { meta } : {}) });

exports.created = (res, data, message = 'Cree avec succes') =>
  res.status(201).json({ success: true, message, data });

exports.paginate = (res, rows, total, page, limit, message = 'Succes') =>
  res.status(200).json({
    success: true,
    message,
    data: rows,
    meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
