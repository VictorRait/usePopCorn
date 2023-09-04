import { useEffect, useState } from "react";
const KEY = "5e68752";
export function useMovies(query){
      const [movies, setMovies] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
    useEffect(
        function () {
          
          const controller = new AbortController()
          async function fetchMovies() {
            try {
              setLoading(true);
              const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal});
              setError("");
              if (!res.ok) throw new Error("Something went wrong with fetching movies");
              const data = await res.json();
    
              if (data.Response === "False") throw new Error("Movie not found");
              setMovies(data.Search);
              setLoading(false);
            } catch (err) {
              if (err.name !== 'AbortError')
              setError(err.message);
            } finally {
              setLoading(false);
            }
          }
          if (!query.length) {
            setMovies([]);
            setError("");
            return;
          }
  
          fetchMovies();
    
          return function(){
            controller.abort()
          }
        },
        [query]
      );
      return {movies,isLoading, error}
}