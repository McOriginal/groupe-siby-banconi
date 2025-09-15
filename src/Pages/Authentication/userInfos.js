let connectedUserId = null;
let connectedUserName = null;
let connectedUserEmail = null;
let connectedUserRole = null;
let connectedUserBoutique = null;

const authUser = localStorage.getItem('authUser');

if (authUser) {
  try {
    const dataParse = JSON.parse(authUser);

    connectedUserId = dataParse?.user?.id || null;
    connectedUserName = dataParse?.user?.name || null;
    connectedUserEmail = dataParse?.user?.email || null;
    connectedUserRole = dataParse?.user?.role || null;
    connectedUserBoutique =
      dataParse?.user?.boutique != null
        ? Number(dataParse.user.boutique)
        : null;
  } catch (error) {
    console.error('Erreur lors du parsing de authUser :', error);
  }
}

export {
  connectedUserId,
  connectedUserName,
  connectedUserEmail,
  connectedUserRole,
  connectedUserBoutique,
};
