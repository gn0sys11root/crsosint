import { NextRequest, NextResponse } from 'next/server'

// Función para generar nombre de repo aleatorio
function generateRandomRepoName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const randomSuffix = Array.from({length: 8}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `temp-osint-${randomSuffix}`
}

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json()

    if (!email || !token) {
      return NextResponse.json(
        { success: false, error: 'Email y token son requeridos' },
        { status: 400 }
      )
    }

    console.log(`🔍 Buscando perfil de GitHub para email: ${email}`)

    // Verificar que el token sea válido y obtener el username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'email-checker',
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!userResponse.ok) {
      console.log(`❌ Token inválido o sin permisos`)
      return NextResponse.json({
        success: false,
        error: 'Token de GitHub inválido o sin permisos'
      }, { status: 401 })
    }

    const authenticatedUser = await userResponse.json()
    const username = authenticatedUser.login
    console.log(`✅ Token válido para usuario: ${username}`)

    // Generar nombre de repo aleatorio
    const repoName = generateRandomRepoName()
    console.log(`📁 Creando repo temporal: ${repoName}`)

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'email-checker'
    }

    try {
      // 1. Crear repositorio temporal privado
      const repoData = {
        name: repoName,
        private: true,
        auto_init: true,
        description: 'Temporary OSINT repository - will be deleted'
      }

      const createRepoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify(repoData)
      })

      if (!createRepoResponse.ok) {
        console.log(`❌ Error creando repositorio: ${createRepoResponse.status}`)
        return NextResponse.json({
          success: false,
          error: 'Error creando repositorio temporal'
        }, { status: 500 })
      }

      console.log(`✅ Repositorio temporal creado: ${repoName}`)
      
      // Esperar para que el repo esté listo
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 2. Hacer commit con el email objetivo como author y committer
      const commitData = {
        message: 'OSINT email test commit',
        committer: {
          name: 'OSINT Test',
          email: email
        },
        author: {
          name: 'OSINT Test',
          email: email
        },
        content: 'T1NJTlQgVGVzdA==' // "OSINT Test" en base64
      }

      const commitUrl = `https://api.github.com/repos/${username}/${repoName}/contents/osint-test.txt`
      const commitResponse = await fetch(commitUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(commitData)
      })

      if (!commitResponse.ok) {
        console.log(`❌ Error en commit: ${commitResponse.status}`)
        // Limpiar repo antes de retornar error
        await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
          method: 'DELETE',
          headers
        })
        return NextResponse.json({
          success: false,
          error: 'Error realizando commit con email objetivo'
        }, { status: 500 })
      }

      console.log(`✅ Commit realizado con email: ${email}`)
      
      // Esperar para que el commit se procese
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 3. Obtener información del commit para ver qué cuenta se asoció
      const commitsUrl = `https://api.github.com/repos/${username}/${repoName}/commits`
      const commitsResponse = await fetch(commitsUrl, { headers })

      if (!commitsResponse.ok) {
        console.log(`❌ Error obteniendo commits: ${commitsResponse.status}`)
        // Limpiar repo
        await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
          method: 'DELETE',
          headers
        })
        return NextResponse.json({
          success: false,
          error: 'Error obteniendo información del commit'
        }, { status: 500 })
      }

      const commits = await commitsResponse.json()
      
      if (!commits || commits.length === 0) {
        console.log(`❌ No se encontraron commits`)
        // Limpiar repo
        await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
          method: 'DELETE',
          headers
        })
        return NextResponse.json({
          success: false,
          error: 'No se encontraron commits en el repositorio'
        }, { status: 500 })
      }

      const latestCommit = commits[0]
      const authorInfo = latestCommit.author

      // Limpiar repo temporal
      console.log('🧹 Eliminando repositorio temporal...')
      const deleteResponse = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
        method: 'DELETE',
        headers
      })

      if (deleteResponse.ok) {
        console.log(`✅ Repositorio temporal eliminado`)
      } else {
        console.log(`⚠️ Error eliminando repositorio: ${deleteResponse.status}`)
      }

      // 4. Verificar si se encontró una cuenta asociada
      if (authorInfo && authorInfo.login) {
        console.log(`🎯 ¡CUENTA ENCONTRADA! Username: ${authorInfo.login}`)
        
        // 5. Obtener información detallada del usuario encontrado
        const userDetailResponse = await fetch(`https://api.github.com/users/${authorInfo.login}`, {
          headers
        })

        if (!userDetailResponse.ok) {
          return NextResponse.json({
            success: true,
            found: true,
            platform: 'github.com',
            method: 'temp_commit',
            profileData: {
              username: authorInfo.login,
              user_id: authorInfo.id,
              avatar_url: authorInfo.avatar_url,
              profile_url: `https://github.com/${authorInfo.login}`
            }
          })
        }

        const userDetails = await userDetailResponse.json()

        // 6. Obtener repositorios recientes
        const reposResponse = await fetch(`https://api.github.com/users/${authorInfo.login}/repos?sort=updated&per_page=5`, {
          headers
        })

        let repositories: any[] = []
        if (reposResponse.ok) {
          const reposData = await reposResponse.json()
          repositories = reposData.slice(0, 3).map((repo: any) => ({
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            url: repo.html_url,
            updated_at: repo.updated_at
          }))
        }

        const profileData = {
          username: userDetails.login,
          id: userDetails.id,
          name: userDetails.name,
          bio: userDetails.bio,
          location: userDetails.location,
          company: userDetails.company,
          blog: userDetails.blog,
          twitter_username: userDetails.twitter_username,
          avatar_url: userDetails.avatar_url,
          public_repos: userDetails.public_repos,
          public_gists: userDetails.public_gists,
          followers: userDetails.followers,
          following: userDetails.following,
          created_at: userDetails.created_at,
          updated_at: userDetails.updated_at,
          profile_url: userDetails.html_url,
          type: userDetails.type,
          repositories
        }

        console.log(`🎉 Perfil completo obtenido para ${email}: ${profileData.username}`)

        return NextResponse.json({
          success: true,
          found: true,
          platform: 'github.com',
          method: 'temp_commit',
          profileData
        })

      } else {
        console.log(`⚠️ Cuenta configurada para bloquear commits falsos o email no asociado`)
        return NextResponse.json({
          success: true,
          found: false,
          platform: 'github.com',
          message: 'El email no está asociado a ninguna cuenta de GitHub o la cuenta tiene configuración para bloquear commits con emails no verificados.'
        })
      }

    } catch (commitError) {
      // Intentar limpiar el repo si algo falla
      console.log(`❌ Error durante el proceso: ${commitError}`)
      try {
        await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
          method: 'DELETE',
          headers
        })
      } catch (cleanupError) {
        console.log(`⚠️ Error limpiando repo: ${cleanupError}`)
      }
      
      return NextResponse.json({
        success: false,
        error: 'Error durante el proceso de commit temporal'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error general en búsqueda de GitHub:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno del servidor'
    }, { status: 500 })
  }
}
