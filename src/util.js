/**
 * Determine if a uuid is a valid Minecraft user identifier.
 * @param {String} uuid - Identifier to validate.
 * @returns {boolean} - Whether the given uuid is valid.
 */
function isValidUUID(uuid) {
  const regex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
  return uuid && regex.test(uuid);
}

module.exports = { isValidUUID };
