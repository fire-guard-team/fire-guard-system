import Main_Logo from "/assets/logos/fireguardLogo.png";

const MainLogo = () => {
  return (
          <div className="h-10 w-10 rounded-lg flex items-center justify-center">
            <img
              src={Main_Logo}
              alt="Fire Guard"
              className="h-14 w-14 object-contain"
            />
          </div>
  );
};

export default MainLogo;
