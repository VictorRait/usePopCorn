import {  useEffect, useState,useRef } from "react";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";
import { useMovies } from "./useMovies";

const KEY = "5e68752";
const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  // const [watched, setWatched] = useState([]);
  // const [movies, setMovies] = useState([]);
  // const [isLoading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // const [watched, setWatched] = useState(function(){
  //   const storedValue = localStorage.getItem('watched')
  //   return JSON.parse(storedValue)
  // })
  const [watched, setWatched] = useLocalStorageState([], 'watched')
const {movies,isLoading,error} = useMovies(query)

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie){
    setWatched(watched => [...watched, movie]) 

   
  }
  function handleDeleteWatched(id){
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }
  // useEffect(
  //   function(){
  //    localStorage.setItem('watched', JSON.stringify(watched))

  // },[watched])
 

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MoviesList movies={movies.slice(0,4)}/>} */}
          {isLoading && !error && <Loader />}
          {!isLoading && !error && (
            <MoviesList onSelectMovie={handleSelectMovie} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails watched={watched} onAddWatched={handleAddWatched} onCloseMovie={handleCloseMovie} selectedId={selectedId} />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function MovieDetails({ selectedId, onCloseMovie,onAddWatched,watched }) {
  const [movie, setMovie] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [userRating, setUserRating] = useState([])
  const countRef = useRef(0)
  useEffect(function(){
    if (userRating[0]) countRef.current = countRef.current + 1
  }, [userRating])
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd(){

    const newWatchedMovie = {
      imdbID:selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating: userRating[0],
      maxRating: userRating[1],
      userRatingDecisions: countRef.current
    }
    onAddWatched(newWatchedMovie)
    onCloseMovie()

  }
  // useEffect(
  //   function (){
  //     function callback(e){
  //       if (e.code === 'Escape')
  //       onCloseMovie()
       
  //     }

  //     document.addEventListener('keydown', callback)

  //     return function(){
  //       document.removeEventListener('keydown', callback)
  //     }
  //   },[onCloseMovie]
  // )
  // issue fix
  useKey('Escape', onCloseMovie )
 
  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setIsLoading(true)
          const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
          if (res.Response === 'False') throw new Error('Something went wrong fetching the movie')
          const data = await res.json();
    
          setMovie(data);
          setIsLoading(false)
        
        }
        catch (err){
         console.error(err.message)
        }
      }
      getMovieDetails();
    },
    [selectedId]
  );
  useEffect(
    function(){
    if (!title) return;
    document.title= `Movie | ${title}`

    return function(){
      document.title = 'usePopcorn'
    }
  }, [title])
    const watchedNow =  watched.filter(movie => movie.imdbID === selectedId)
  return (
    <div className="details">
      {isLoading ? <Loader /> : <>
      <header>
        <button className="btn-back" onClick={onCloseMovie}>
          &larr;
        </button>
        <img src={poster} alt={`Poster of ${title} movie`}></img>
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDB Rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          { watchedNow.length >= 1 ? `You have rated this movie ${watchedNow[0].userRating} out of ${watchedNow[0].maxRating} stars` : <> <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
          {userRating[0] > 0 && <button className="btn-add" onClick={handleAdd}>+ Add to list</button>}</>}
         
        </div>
        <p>
          <em>{plot}</em>
        </p>
        <p>Starring {actors}</p>
        <p>Directed by: {director}</p>
      </section>
      </>}
    </div>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return <p className="error">!! {message} !!</p>;
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null)

  useKey('Escape', function(){
    if (document.activeElement === inputEl.current) return
    inputEl.current.focus()
    setQuery('')
  })

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button className="btn-toggle" onClick={() => setIsOpen2((open) => !open)}>
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMovieList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }
function MoviesList({ movies, onSelectMovie}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>📅</span>
          <span>{movie.Year}</span>
        </p>
      </div>
      
    </li>
  );
}

function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie,idx) => (
        <WatchedMovie  onDeleteWatched={onDeleteWatched}  key={idx} movie={movie} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)} >X</button>
    </li>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
