import {useEffect, useState} from 'react'
import {gt as semverGt} from 'semver'
import packageJson from '../../../package.json'

const useSemverCheck = () => {
  const [currentVersion, setCurrentVersion] = useState(null)
  const [latestVersion, setLatestVersion] = useState(null)
  const [isVersionOutdated, setIsVersionOutdated] = useState(false)

  const deleteCacheAndReload = async () => {
    if (caches) {
      try {
        // Get the cache keys
        const cacheKeys = await caches.keys()
        // Delete the cache
        await Promise.all(cacheKeys.map(key => caches.delete(key)))
        
        // Reload the page
        // Note: passing true (as the forceGet boolean parameter) to location.reload() is non-standard and is only supported by Firefox, so it is omitted here
        window.location.reload()
      } catch {
        console.log('Error clearing cache')
      }
    }
  }

  useEffect(() => {
    (async () => {
      // Get the latest version from meta.json
      // Specify no-store for the cache option to ensure that we always fetch an uncached meta.json
      const res = await fetch('/meta.json', {
        cache: 'no-store',
      })
      const meta = await res.json()
      const latestVersion = meta.version
      setLatestVersion(latestVersion)
      
      // Get the current version from package.json
      const currentVersion = packageJson.version
      setCurrentVersion(currentVersion)

      console.log(`Current version: ${currentVersion}`)
      console.log(`Latest version: ${latestVersion}`)

      // Check if the latest version is newer than the current version
      if (semverGt(latestVersion, currentVersion)) setIsVersionOutdated(true)
    })();
  }, [])

  return {currentVersion, latestVersion, isVersionOutdated, deleteCacheAndReload}
}

export default useSemverCheck